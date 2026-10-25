# Spotify-Web-Api-Quiz-App
Summer Project 2022

I made an easy web api app that allowed users to quiz themselves on the provided statistics within the Spotify API framework
Still adding minor fixes and touch ups.

## Running the app

The Spotify client secret must not be included in browser code. For local development, set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as environment variables and run:

```sh
npm install
npm start
```

Open `http://localhost:3000`. Express serves the app and exchanges credentials at `/api/token`; the browser receives only the short-lived access token used for Spotify API requests.

### GitHub Pages deployment

GitHub Pages serves the static frontend but cannot run the token endpoint. To keep the frontend on GitHub Pages, deploy the Netlify Function in `netlify/functions/token.js` separately:

1. Create a Netlify site connected to this repository. The included `netlify.toml` configures the function directory.
2. In Netlify's environment variable settings, set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `GITHUB_PAGES_ORIGIN` (for example, `https://rowan7401.github.io`). For a custom GitHub Pages domain, use that domain's origin instead.
3. After deploying, set the `spotify-token-endpoint` meta tag in `index.html` to `https://<your-netlify-site>/.netlify/functions/token`.
4. Keep GitHub Pages pointed at the repository's static frontend.

The endpoint only allows browser requests from the configured GitHub Pages origin. The endpoint URL and client ID are not secrets; the client secret must remain in Netlify's server-side environment variables. Do not commit credentials or put them in frontend code.

The client secret previously embedded in `index.js` has been exposed and must be revoked in the Spotify Developer Dashboard. Generate a replacement and set it as `SPOTIFY_CLIENT_SECRET` in the server environment (or Netlify environment variables for the Pages setup) before running the app.
