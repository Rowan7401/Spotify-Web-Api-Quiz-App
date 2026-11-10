export default async function getSpotifyAccessToken(clientId, clientSecret) {
    const credentials = new TextEncoder().encode(`${clientId}:${clientSecret}`);
    let binaryCredentials = '';
    for (const byte of credentials) {
        binaryCredentials += String.fromCharCode(byte);
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(binaryCredentials)}`
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    });

    if (!response.ok) {
        throw new Error(`Spotify token request failed with status ${response.status}.`);
    }

    const data = await response.json();
    if (!data.access_token) {
        throw new Error('Spotify token response did not include an access token.');
    }

    return data.access_token;
}
