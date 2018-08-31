const needle = require('needle');
const store = require('./store');
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

      throw new Error(`radiooooo request failed ${method} ${res.statusCode} ${endpoint} ${JSON.stringify(body)}`);
    });
}

/**
  * @param {string} decade - the requested decade 1960
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @return {object} { 1960 : ['AFG', 'ANT', ... ] }
*/
async function getCountriesByFilters(decade, moods) {
  const endpoint = `playlist/countriesByTempos/${decade}?moods=${moods.join('%2')}`;
  const countriesPerDecade = await request('get', endpoint);
  return countriesPerDecade[decade];
}

/**
  * @param {string} decade - the requested decade 1960
  * @param {string} country - the requested country code (ITA)
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @return {object} { countries : ['ITA'], playlist: 358289, song : { artists, album, title, year } }
*/
async function createPlaylist(decade, country, moods) {
  const endpoint = 'playlist/next';
  return request('post', endpoint, {
    decade, country, moods,
  });
}

/**
  * @param {string} playlistId - the playlist id (3swbUAGZ7GpPfwZlIevvuF)
  * @param {string} decade - the requested decade 1960
  * @param {string} country - the requested country code (ITA)
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @return {object} a song object { artists, album, title, year }
*/
async function getSong(playlistId, decade, country, moods) {
  const endpoint = `playlist/${playlistId}/next`;
  return request('put', endpoint, {
    country, decade, moods,
  }).then(async res => res.song);
}

/**
  * @param {number} count - the number of songs to fetch
  * @param {string} decade - the requested decade 1960
  * @param {string} country - the requested country code (ITA)
  * @param {array} moods - the requested moods. available: ['SLOW', 'FAST', 'WEIRD']
  * @return {array} an array of songs [{ artists, album, title, year },...]
*/
async function getSongs(count, decade, country, moods) {
  const songs = [];

  let playlistId = await store.get('radiooooo_playlist_id');
  if (!playlistId) {
    const res = await createPlaylist(decade, country, moods);
    playlistId = res.playlist;
    songs.push(res.song);
    store.set('radiooooo_playlist_id', playlistId);
  }

  async function recurse() {
    const song = await getSong(playlistId, decade, country, moods);
    const songExistsInList = songs.find((s) => {
      return s.artists === song.artists
      && s.title === song.title
      && s.album === song.album;
    });

    // radiooooo internally tracks played songs using the playlistId
    // if a fetched song is already in the list, we've reached the end of
    // the song list matching our desired criteria - exit.
    if (!songExistsInList) {
      songs.push(song);
      if (songs.length <= count) await recurse();
    }
  }

  await recurse();
  return songs;
}


module.exports = {
  getSongs,
  getCountriesByFilters,
};
