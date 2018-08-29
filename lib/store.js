const dirty = require('dirty');

const odb = dirty('store.db');
const keys = [
  'spotify_access_token',
  'spotify_refresh_token',
  'spotify_user_id',
  'radiooooo_playlist_id',
];

/**
  * @param {string} key - a string matching any of the predefined keys
  * @return {promise}
*/
async function get(key) {
  return new Promise(async (resolve, reject) => {
    if (!keys.includes(key)) {
      reject(new Error('key not found'));
      return;
    }

    resolve(odb.get(key));
  });
}

/**
  * @param {string} key - a string matching any of the predefined keys
  * @param {any} value - any
  * @return {promise}
*/
async function set(key, value) {
  return new Promise(async (resolve, reject) => {
    if (!keys.includes(key)) {
      reject(new Error('key not found'));
      return;
    }

    odb.set(key, value, async () => {
      resolve();
    });
  });
}

module.exports = {
  get,
  set,
};
