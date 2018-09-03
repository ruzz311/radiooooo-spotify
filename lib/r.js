const needle = require('needle');
const store = require('./store');
const countries = require('./countries');
const { config } = require('../config');

/**
  * @param {string} method - the http method (get, put...)
  * @param {string} endpoint - the endpoint (playlist/next)
  * @param {object} body - the payload to send in a put or post request
  * @return {object} the response body
*/
async function request(method, endpoint, body) {
  const url = `${config.RADIOOOOO.BASE_URL}/${endpoint}`;
  return needle(method, url, body, { json: true })
    .then(async (res) => {
      if (res.statusCode < 300) {
        return res.body;
      }

      throw new Error(`radiooooo request failed ${method} ${res.statusCode} ${url} ${JSON.stringify(body)}`);
    });
}

/**
  * @return {string} a playlistId 358289
*/
async function getPlaylistId() {
  let playlistId = await store.get('radiooooo_playlist_id');

  if (!playlistId) {
    playlistId = await createPlaylist(); // eslint-disable-line no-use-before-define
    store.set('radiooooo_playlist_id', playlistId);
  }

  return playlistId;
}

/**
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @param {string} decade - the requested decade 1960
  * @return {object} { 1960 : ['AFG', 'ANT', ... ] }
*/
async function getCountriesByFilters(moods, decade) {
  const endpoint = `playlist/countriesByTempos/${decade}?moods=${moods.join('%2C')}`;
  const countriesPerDecade = await request('get', endpoint);
  return countriesPerDecade[decade];
}

/**
  * @return {string} a playlistId 358289
*/
async function createPlaylist() {
  // always create a playlist with a country, decade and mood guaranteed to work
  const endpoint = 'playlist/next?moods=FAST';
  const res = await request('post', endpoint, {
    decade: '1990', country: 'USA',
  });
  return res.playlist;
}

/**
  * @param {string} playlistId - the playlist id (3swbUAGZ7GpPfwZlIevvuF)
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @param {string} decade - the requested decade 1960
  * @param {string} country - the requested country code (ITA)
  * @return {object} a song object { artists, album, title, year }
*/
async function getSongByCountry(playlistId, moods, decade, country) {
  const endpoint = `playlist/${playlistId}/next`;
  return request('put', endpoint, {
    country, decade, moods,
  }).then(async res => res.song);
}

/**
  * @param {number} count - the number of songs to fetch
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @param {string} decade - the requested decade 1960
  * @param {string} country - the requested country code (ITA)
  * @return {array} an array of songs [{ artists, album, title, year },...]
*/
async function getSongsByCountry(count, moods, decade, country) {
  const songs = [];
  const maxRecursionCount = count * 2;
  const playlistId = await getPlaylistId();
  let recursionCount = 0;

  async function recurse() {
    try {
      recursionCount += 1;

      const song = await getSongByCountry(playlistId, moods, decade, country);
      const songExistsInList = songs.find(s => (
        s.artists === song.artists && s.title === song.title
      ));

      // radiooooo internally tracks played songs using the playlistId
      // if a fetched song is already in the list, we've begun looping
      // the playlist - exit.
      if (!songExistsInList) {
        songs.push(song);
        if (recursionCount < maxRecursionCount && songs.length < count) await recurse();
      }
    } catch (e) {
      // radiooooo could respond with any status code if something is not found
      // ignore errors and proceed, but die if infinite recursion is possible
      if (recursionCount < maxRecursionCount) await recurse();
    }
  }

  await recurse();
  return songs;
}

/**
  * @param {number} count - the number of songs to fetch
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @param {string} decade - the requested decade 1960
  * @param {string} region - the requested region code 039
  * @param {array} supportedCountryCodes - supported countries for this mood and decade request
  * @return {array} an array of songs [{ artists, album, title, year },...]
*/
async function getSongsByRegion(count, moods, decade, region, supportedCountryCodes) {
  const songs = [];
  const maxRecursionCount = count * 2;
  const playlistId = await getPlaylistId();
  const availableCountryCodes = countries.filter(c => (
    c['sub-region-code'] === region && supportedCountryCodes.includes(c['alpha-3'])
  )).map(c => c['alpha-3']);

  let countryCodeIdx = Math.floor(Math.random() * availableCountryCodes.length);
  let recursionCount = 0;

  async function recurse() {
    try {
      countryCodeIdx = availableCountryCodes[countryCodeIdx + 1] ? countryCodeIdx + 1 : 0;
      recursionCount += 1;

      const country = availableCountryCodes[countryCodeIdx];
      const song = await getSongByCountry(playlistId, moods, decade, country);
      const songExistsInList = songs.find(s => (
        s.artists === song.artists && s.title === song.title
      ));

      if (!songExistsInList) songs.push(song);
      if (recursionCount < maxRecursionCount && songs.length < count) await recurse();
    } catch (e) {
      // radiooooo could respond with any status code if something is not found
      // ignore errors and proceed, but die if infinite recursion is possible
      if (recursionCount < maxRecursionCount) await recurse();
    }
  }

  await recurse();
  return songs;
}

module.exports = {
  getSongsByCountry,
  getSongsByRegion,
  getCountriesByFilters,
};
