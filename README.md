# Spotify-Web-Api-Quiz-App
Summer Project 2022

I made an easy web api app that allowed users to quiz themselves on the provided statistics within the Spotify API framework
Still adding minor fixes and touch ups.

## Running the app

The app requires a server because Spotify's client secret must not be included in browser code. Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as server environment variables, then run:

```sh
npm install
npm start
```

Open `http://localhost:3000`. The Express server serves the app and exchanges the Spotify client credentials at `/api/token`; the browser receives only the short-lived access token used for Spotify API requests. Configure the same environment variables in your hosting provider when deploying. Do not put the client secret in frontend code or commit it to the repository.

The client secret previously embedded in `index.js` has been exposed and must be revoked in the Spotify Developer Dashboard. Generate a replacement and set it as `SPOTIFY_CLIENT_SECRET` in the server environment before running the app.
