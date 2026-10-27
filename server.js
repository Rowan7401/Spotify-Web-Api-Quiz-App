const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.post('/api/token', async (request, response) => {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        return response.status(500).json({ error: 'Spotify credentials are not configured.' });
    }

    try {
        const { default: getSpotifyAccessToken } = await import('./spotify-auth.mjs');
        response.set('Cache-Control', 'no-store').json({
            access_token: await getSpotifyAccessToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
        });
    } catch (error) {
        console.error('Spotify token request failed:', error.message);
        response.status(502).json({ error: 'Unable to retrieve a Spotify access token.' });
    }
});

app.use(express.static(path.join(__dirname), { dotfiles: 'deny' }));

app.listen(port, () => {
    console.log(`Spotistatify is available on port ${port}.`);
});
