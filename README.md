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

## Game code

The browser uses native JavaScript modules; no bundler is required. `src/api/spotify-api.js` handles Spotify requests, `src/ui/ui-controller.js` handles DOM updates, and `src/game/app-controller.js` coordinates the application and game session.

Game content is registered in `src/game/question-catalog.js`. Each entry identifies its answer input type and setup function; reusable input presentation lives in `src/game/question-input.js`. The files under `src/game/modes/` define each mode's question selection policy, while the app controller owns shared scoring, timing, and screen transitions. To add a question, register its setup and input type, then include its ID in the applicable mode file.

Run the focused game configuration tests with `npm test`.
