const needle = require('needle');
const store = require('./store');
const config = require('../config');

async function request(method, endpoint, body) {
  const url = `${config.RADIOOOOO.BASE_URL}/${endpoint}`;
  return needle(method, url, body, { json: true })
    .then(async res => res.body);
}

/*
  decade: 1960
  country: 'ITA'
  moods: ['SLOW', 'FAST', 'WEIRD']
*/
async function createPlaylist(decade, country, moods) {
  const endpoint = '/playlist/next';
  return request('post', endpoint, {
    decade, country, moods,
  });
}

/*
  playlistId: 123456
  decade: 1960
  country: 'ITA'
  moods: ['SLOW', 'FAST', 'WEIRD']
*/
async function getSong(playlistId, decade, country, moods) {
  const endpoint = `playlist/${playlistId}/next`;
  return request('put', endpoint, {
    country, decade, moods,
  }).then(async res => res.song);
}

/*
  count: 20
  decade: 1960
  country: 'ITA'
  moods: ['SLOW', 'FAST', 'WEIRD']
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
    await getSong(playlistId, decade, country, moods)
      .then(async s => songs.push(s));

    if (songs.length <= count) await recurse();
  }

  await recurse();
  return songs;
}


module.exports = {
  getSongs,
};
