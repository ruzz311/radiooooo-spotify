# radiooooo-spotify
Creates spotify playlists based on decade and mood, songs found via [radiooooo](http://radiooooo.com/).

## Running
You'll need to create a .env file at the root of this project directory with the following properties in order to auth and use Spotify's API: `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. You can create your own app [here](https://developer.spotify.com/web-api/). The .env file should look like this:
```
SPOTIFY_CLIENT_ID=b4fd2ec18252400db3c7e1ae2a6cd683
SPOTIFY_CLIENT_SECRET=31844df3c8d3412ff562718e9ff3x637
```

The app is currently only available via a command line tool. After creating your .env file, run `npm start`;