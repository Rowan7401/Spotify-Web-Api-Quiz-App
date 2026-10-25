const getSpotifyAccessToken = require('../../spotify-auth');

exports.handler = async (event) => {
    const allowedOrigin = process.env.GITHUB_PAGES_ORIGIN;
    const requestOrigin = event.headers.origin;

    if (!allowedOrigin) {
        return jsonResponse(500, { error: 'GitHub Pages origin is not configured.' });
    }

    if (requestOrigin && requestOrigin !== allowedOrigin) {
        return jsonResponse(403, { error: 'Origin is not allowed.' });
    }

    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
        Vary: 'Origin'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders };
    }

    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' }, corsHeaders);
    }

    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        return jsonResponse(500, { error: 'Spotify credentials are not configured.' }, corsHeaders);
    }

    try {
        const accessToken = await getSpotifyAccessToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
        return jsonResponse(200, { access_token: accessToken }, corsHeaders);
    } catch (error) {
        console.error('Spotify token request failed:', error.response?.status || error.message);
        return jsonResponse(502, { error: 'Unable to retrieve a Spotify access token.' }, corsHeaders);
    }
};

function jsonResponse(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
    };
}
