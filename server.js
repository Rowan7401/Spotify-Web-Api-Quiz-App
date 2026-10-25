const axios = require('axios');
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
        const spotifyResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
                }
            }
        );

        response.set('Cache-Control', 'no-store').json({
            access_token: spotifyResponse.data.access_token
        });
    } catch (error) {
        console.error('Spotify token request failed:', error.response?.status || error.message);
        response.status(502).json({ error: 'Unable to retrieve a Spotify access token.' });
    }
});

app.use(express.static(path.join(__dirname), { dotfiles: 'deny' }));

app.listen(port, () => {
    console.log(`Spotistatify is available on port ${port}.`);
});
