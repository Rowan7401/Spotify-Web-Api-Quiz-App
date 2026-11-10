import getSpotifyAccessToken from '../spotify-auth.mjs';

export default {
    async fetch(request, env) {
        const allowedOrigin = env.GITHUB_PAGES_ORIGIN;
        const requestOrigin = request.headers.get('Origin');

        if (!allowedOrigin) {
            return jsonResponse({ error: 'GitHub Pages origin is not configured.' }, 500);
        }

        const corsHeaders = {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store',
            Vary: 'Origin'
        };

        if (requestOrigin !== allowedOrigin) {
            return jsonResponse({ error: 'Origin is not allowed.' }, 403, corsHeaders);
        }

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed.' }, 405, corsHeaders);
        }

        if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
            return jsonResponse({ error: 'Spotify credentials are not configured.' }, 500, corsHeaders);
        }

        try {
            const accessToken = await getSpotifyAccessToken(
                env.SPOTIFY_CLIENT_ID,
                env.SPOTIFY_CLIENT_SECRET
            );
            return jsonResponse({ access_token: accessToken }, 200, corsHeaders);
        } catch (error) {
            console.error('Spotify token request failed:', error.message);
            return jsonResponse({ error: 'Unable to retrieve a Spotify access token.' }, 502, corsHeaders);
        }
    }
};

function jsonResponse(body, status, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers }
    });
}
