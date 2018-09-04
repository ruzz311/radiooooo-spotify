const result = require('dotenv').config();
const ENV = process.env;

if (result.error) {
  throw result.error
}


const config = {
  PORT: ENV.PORT,
  SPOTIFY: {
    AUTH_SCOPE: 'playlist-modify-private ugc-image-upload',
    AUTH_TIMEOUT: 30000,
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
    CLIENT_ID: ENV.SPOTIFY_CLIENT_ID,
    CLIENT_SECRET: ENV.SPOTIFY_CLIENT_SECRET,
    BASE_URL: 'https://api.spotify.com/v1',
  },
  RADIOOOOO: {
    BASE_URL: 'http://radiooooo.com/api',
  },
};

module.exports = {
  config,
};
