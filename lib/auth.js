const http = require('http');
const Ee = require('events');
const url = require('url');
const opn = require('opn');
const qs = require('querystring');
const needle = require('needle');
const config = require('../config');
const store = require('./store');

const rediretUri = `http://localhost:${config.PORT}`;

/**
  * @param {string} code - a single use code for retrieving access and refresh tokens (Af13EmI...)
  * @return {object} access and refresh tokens { accessToken: 'abc123', refreshToken: 'xyx789' }
*/
async function getToken(code) {
  const authString = `${config.SPOTIFY.CLIENT_ID}:${config.SPOTIFY.CLIENT_SECRET}`;
  const encodedAuthHeader = Buffer.from(authString).toString('base64');

  return needle('post', config.SPOTIFY.TOKEN_URL, {
    code,
    redirect_uri: rediretUri,
    grant_type: 'authorization_code',
  }, {
    headers: {
      Authorization: `Basic ${encodedAuthHeader}`,
    },
  }).then(async (res) => {
    if (res.statusCode === 200 && res.body && res.body.access_token && res.body.refresh_token) {
      return {
        accessToken: res.body.access_token,
        refreshToken: res.body.refresh_token,
      };
    }
    const message = `spotify token error: ${res.statusCode} ${JSON.stringify(res.body)}`;
    return new Error(message);
  });
}

/**
  * @return {EventEmitter} emits an event when any request is made with the queryParam of code
*/
function createHttpListener() {
  const emitter = new Ee();
  const httpServer = http.createServer((req, res) => {
    const { query: { code } } = url.parse(req.url, true);

    if (code) {
      res.writeHead(200);
      res.write('All done. You can close this window.');
      res.end();
      httpServer.close();
      emitter.emit('done', code);
    } else {
      res.writeHead(500); res.write('It\'s Broken');
      res.end();
    }
  }).listen(config.PORT);

  return emitter;
}

/**
  * @return {Promise} resolved when auth is successful
*/
async function auth() {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('timeout'));
    }, config.SPOTIFY.AUTH_TIMEOUT);

    createHttpListener().once('done', async (code) => {
      const { accessToken, refreshToken } = await getToken(code);
      await store.set('spotify_access_token', accessToken);
      await store.set('spotify_refresh_token', refreshToken);
      clearTimeout(timeout);
      resolve();
    });

    const authQueryString = qs.stringify({
      response_type: 'code',
      client_id: config.SPOTIFY.CLIENT_ID,
      scope: config.SPOTIFY.AUTH_SCOPE,
      redirect_uri: rediretUri,
    });

    opn(`${config.SPOTIFY.AUTH_URL}?${authQueryString}`);
  });
}

module.exports = {
  auth,
};
