const axios = require('axios');

module.exports = async function getSpotifyAccessToken(clientId, clientSecret) {
    const spotifyResponse = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        }
    );

    const accessToken = spotifyResponse.data.access_token;
    if (!accessToken) {
        throw new Error('Spotify token response did not include an access token.');
    }

    return accessToken;
};
