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

### GitHub Pages deployment

GitHub Pages serves the static frontend but cannot run the token endpoint. To keep the frontend on GitHub Pages, deploy the Cloudflare Worker in `cloudflare/worker.mjs` separately:

1. Authenticate with Cloudflare using `npx wrangler login`.
2. Set the Worker secrets with `npx wrangler secret put SPOTIFY_CLIENT_ID` and `npx wrangler secret put SPOTIFY_CLIENT_SECRET`.
3. Check `GITHUB_PAGES_ORIGIN` in `wrangler.toml`. The default is `https://rowan7401.github.io`; for a custom GitHub Pages domain, replace it with that site's origin.
4. Deploy from the repository root with `npx wrangler deploy`.
5. Set the `spotify-token-endpoint` meta tag in `index.html` to the Worker URL printed by Wrangler, such as `https://spotistatify-token.<your-subdomain>.workers.dev/`.
6. Keep GitHub Pages pointed at the repository's static frontend.

The Worker returns only a short-lived access token, never the client secret. It allows browser requests from the configured GitHub Pages origin, but CORS is not authentication: the Worker endpoint is public and non-browser callers can invoke it too. The endpoint URL and client ID are not secrets; the client secret must remain in Cloudflare's Worker secrets. Do not commit credentials or put them in frontend code.

The client secret previously embedded in `index.js` has been exposed and must be revoked in the Spotify Developer Dashboard. Generate a replacement and set it as `SPOTIFY_CLIENT_SECRET` in the server environment (or as a Cloudflare Worker secret for the Pages setup) before running the app.
