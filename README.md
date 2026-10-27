# Spotify-Web-Api-Quiz-App
Summer Project 2022

I made an easy web api app that allowed users to quiz themselves on the provided statistics within the Spotify API framework
Still adding minor fixes and touch ups.

## Running the app

The Spotify client secret must not be included in browser code. For local development, create an ignored `env.local` file in the repository root with these entries:

```text
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-new-client-secret
```

Then run:

```sh
npm install
npm start
```

The start command loads `env.local` when present (Node.js 22.9 or newer). Open `http://localhost:3000`. Express serves the app and exchanges credentials at `/api/token`; the browser receives only the short-lived access token used for Spotify API requests. Environment variables already set in the shell take precedence over values in the file.
