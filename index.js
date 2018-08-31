require('dotenv').config();

const inquirer = require('inquirer');
const question = require('./lib/question');
const spotify = require('./lib/spotify');
const util = require('./lib/util');
const r = require('./lib/r');

async function run() {
  const { moods } = await inquirer.prompt([question.getMoods()]);
  const { decade } = await inquirer.prompt([question.getDecades()]);
  const countries = await question.getCountries(decade, moods);
  const { country } = await inquirer.prompt(countries);

  const songs = await r.getSongs(16, decade, country, moods);
  const { title, description } = util.createPlaylistMeta(songs, decade, country);
  const playlistId = await spotify.createPlaylist(title, description);

  const trackUris = await Promise.all(
    songs.map(async (song) => {
      return spotify.getTrackUri(song.artists, song.title, song.album);
    }),
  );

  await spotify.addTracksToPlaylist(playlistId, trackUris.filter(i => i));
}

(async () => {
  await run();
})();
