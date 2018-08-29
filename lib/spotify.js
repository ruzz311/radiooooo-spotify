const qs = require('querystring');
const needle = require('needle');
const { auth } = require('./auth');
const store = require('./store');
const config = require('../config');

/**
  * @param {string} method - the http method (get, put...)
  * @param {string} endpoint - the endpoint (users/${userId}/playlist)
  * @param {object} body - the payload to send in a put or post request
*/
async function request(method, endpoint, body) {
  const authToken = await store.get('spotify_access_token');

  return needle(method, `${config.SPOTIFY.BASE_URL}/${endpoint}`, body, {
    json: true,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
    .then(async (res) => {
      if (res.statusCode < 300) {
        return res.body;
      }

      if (res.statusCode === 401) {
        await auth();
        return request(endpoint);
      }

      return new Error(`spotify api error ${res.statusCode}`);
    });
}

/**
 * @return {string} spotify user id
*/
async function getUserId() {
  const user = await request('get', 'me');
  await store.set('spotify_user_id', user.id);
  return user.id;
}

/**
  @param {string} artist - the artist name
  @param {string} track - the track or song name
  @param {string} album - the album name
  @return {string || null} a track uri or null if not found
*/
async function getTrackUri(artist = '', track = '', album = '') {
  const endpoint = 'search';

  const query = qs.encode({
    artist: artist.toLowerCase(),
    track: track.toLowerCase(),
    album: album.toLowerCase(),
  }, '%20', '%3a');
  const res = await request('get', `${endpoint}?q=${query}&type=track`);

  try {
    const tracks = res.tracks.items;
    const match = tracks.sort((x, y) => y.popularity - x.popularity)[0];
    return match ? match.uri : null;
  } catch (e) {
    throw new Error('could not parse spotify search response', res);
  }
}

/**
  * @param {string} name - The Name of the Playlist
  * @param {string} description - A brief description of the playlist
  * @return {string} a playlist id
*/
async function createPlaylist(name, description) {
  const userId = await store.get('spotify_user_id') || await getUserId();
  const endpoint = `users/${userId}/playlists`;
  const playlist = await request('post', endpoint, {
    name, description, public: false,
  });
  return playlist.id;
}

/**
  * @param {string} playlistId: the playlist id (3swbUAGZ7GpPfwZlIevvuF)
  * @param {array} trackUris: array of track uris [spotify:track:1301WleyT98MSxVHPZCA6M,...]
*/
async function addTrackToPlaylist(playlistId, trackUris) {
  const endpoint = `playlists/${playlistId}/tracks`;
  return request('post', endpoint, {
    uris: trackUris,
  });
}

module.exports = {
  createPlaylist,
  addTrackToPlaylist,
};
