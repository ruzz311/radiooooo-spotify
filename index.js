require('dotenv').config();

const inquirer = require('inquirer');
const question = require('./lib/question');
const spotify = require('./lib/spotify');
const util = require('./lib/util');
const r = require('./lib/r');

const ui = new inquirer.ui.BottomBar();

async function run() {
  const { moods } = await inquirer.prompt(question.getMoods());
  const { decade } = await inquirer.prompt(question.getDecades());

  ui.log.write(`Finding regions with ${util.humanJoin(moods)} music from the ${decade}'s...`);

  const countryCodes = await r.getCountriesByFilters(moods, decade);
  const regions = question.getRegions(countryCodes);
  const { region } = await inquirer.prompt(regions);
  const regionName = util.getRegionNameByRegionCode(region);

  ui.log.write(`Searching radiooooo for ${util.humanJoin(moods)} songs from the ${decade}'s made in ${regionName}...`);

  const songs = await r.getSongsByRegion(24, moods, decade, region, countryCodes);
  if (!songs.length) throw new Error('Could not find songs matching your search critera.');

  const artists = [...new Set(songs.map(s => s.artists))];
  ui.log.write(`Found ${songs.length} songs, including work from ${util.humanJoin(artists)}.`);

  const { title, description } = util.createPlaylistMeta(songs, decade, regionName);
  ui.log.write(`Creating a spotify playlist named ${title}...`);
  const playlistId = await spotify.createPlaylist(title, description);

  ui.log.write('Searching spotify for tracks discovered from radiooooo...');
  const trackPromises = await Promise.all(
    songs.map(
      async song => spotify.getTrackUri(song.artists, song.title),
    ),
  );

  const trackUris = trackPromises.filter(i => i);
  if (!trackUris.length) throw new Error('Could not find any matching tracks in radiooooo.');
  ui.log.write(`Found ${trackUris.length} matching tracks in spotify.`);

  ui.log.write(`Adding ${trackUris.length} tracks to spotify...`);
  await spotify.addTracksToPlaylist(playlistId, trackUris.filter(i => i));

  ui.log.write(`Success! Check spotify for your new playlist: ${title}`);
  process.exit();
}

(async () => {
  await run();
})();
