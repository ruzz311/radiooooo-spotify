const http = require('http');
const url = require('url');
const opn = require('opn');
const qs = require('querystring');
const config = require('./config');

function auth() {
  const httpServer = http.createServer((req, res) => {
    const { query } = url.parse(req.url, true);
    const { code } = query;

    if (code) {
      res.writeHead(200);
      res.write('All done. You can close this window.');
      res.end();
      return httpServer.close();
    }

    res.writeHead(500); res.write('It\'s Broken');
    return res.end();
  }).listen(config.PORT);


  const queryString = qs.stringify({
    response_type: 'code',
    client_id: config.SPOTIFY.CLIENT_ID,
    scope: config.SPOTIFY.AUTH_SCOPE,
    redirect_uri: `http://localhost:${config.PORT}`,
  });

  const spotifyAuthUrl = `${config.SPOTIFY.AUTH_URL}?${queryString}`;
  opn(spotifyAuthUrl);
}


module.exports = {
  auth,
};
