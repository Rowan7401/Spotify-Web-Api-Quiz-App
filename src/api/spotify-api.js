'use strict';

const GET_SEVERAL_ARTISTS =
      "https://api.spotify.com/v1/artists?"
    + "ids=7tYKF4w9nC0nq9CsPZTHyP%2C3yY2gUcIsjMr8hjo51PoJ8%2C6olE6TJLqED3rqDCT0FyPh%2C7rkW85dBwwrJtlHRDkJDAC%2C3qiHUAX7zY4Qnjx8TNUzVx%2C"  +
    "4kqFrZkeqDfOIEqTWqbOOV%2C" + "4Ga1P7PMIsmqEZqhYZQgDo%2C" + "4hR6Bm9YYtktXzjmKhb1Cn%2C" + "2eVTKG3Z5bbKk2OWMIe3iL%2C"
    + "3hOdow4ZPmrby7Q1wfPLEy%2C" + "35l9BRT7MXmM8bv2WDQiyB%2C" + "6TIYQ3jFPwQSRmorSezPxX%2C" + 
    "2kxP07DLgs4xlWz8YHlvfh%2C2IDLDx25HU1nQMKde4n61a%2C3MZsBdqDrRTJihTHQrO6Dq%2C4Gso3d4CscCijv0lmajZWs%2C6Xgp2XMz1fhVYe7i6yNAax" +
    "%2C78rUTD7y6Cy67W1RVzYs7t%2C1Xyo4u8uXC1ZmMpatF05PJ" + "%2C4MCBfE4596Uoi2O4DtmEMz" + "%2C5K4W6rqBFWDnAN6FQUkS6x" +
    "%2C0hCNtLu0JehylgoiP8L4Gh" + "%2C181bsRPaVXVlUKXrxwZfHK" + "%2C5cj0lLjcoR7YOSnhnX0Po5" + "%2C5delTPpDAtBDsjk60f5xnt" +
    "%2C4O15NlyKLIASxsJ0PrXPfz" + "%2C246dkjvS1zLTtiykXe5h60" + "%2C6l3HvQ5sa6mXTsMTB19rO5" +"%2C1RyvyyTE3xzB2ZywiAwp0i";

    

const GET_ARTIST = `https://api.spotify.com/v1/artists/{{artistId}}`
const GET_ARTIST_TOP_TRACKS = `https://api.spotify.com/v1/artists/{id}/top-tracks?market=US`
//const GET_RELATED_ARTISTS = "https://api.spotify.com/v1/artists/{id}/related-artists"
const GET_TRACKS = "https://api.spotify.com/v1/tracks?market=US&ids={id}";
// const GET_TRACKS_ANALYSIS = "https://api.spotify.com/v1/audio-features/{id}";

const GET_ALBUMS = "https://api.spotify.com/v1/artists/{id}/albums?include_groups=album&market=US&limit=30&offset=5";

export const APIController = (function () {
    const workerTokenEndpoint = document.querySelector('meta[name="spotify-token-endpoint"]').content;
    const isLocalDevelopment = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    const tokenEndpoint = isLocalDevelopment ? '/api/token' : workerTokenEndpoint;

    // private methods
    const _request = async (url, options) => {
        const response = await fetch(url, options);
        const responseText = await response.text();
        let data;

        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (error) {
            if (!response.ok) {
                throw new Error(`Spotify API request failed (${response.status} ${response.statusText}).`);
            }
            throw new Error('Spotify returned an invalid response.');
        }

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Spotify returned an invalid response.');
        }

        if (!response.ok) {
            const apiMessage = data.error?.message || data.error_description || data.error;
            const detail = typeof apiMessage === 'string' ? `: ${apiMessage}` : '';
            throw new Error(`Spotify API request failed (${response.status} ${response.statusText})${detail}.`);
        }

        return data;
    }

    const _getToken = async () => {

        const data = await _request(tokenEndpoint, {
            method: 'POST'
        });

        if (typeof data.access_token !== 'string' || !data.access_token) {
            throw new Error('Spotify did not return an access token.');
        }
        return data.access_token;
    }

    const _getArtists = async (token) => {

        const data = await _request(GET_SEVERAL_ARTISTS, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!Array.isArray(data.artists)) {
            throw new Error('Spotify returned an invalid artist list.');
        }
        return data.artists;
    }

    const _getArtist = async (token, artistId) => {
        const url = GET_ARTIST.replace("{{artistId}}", artistId);
        return _request(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
    }

    const _getArtistTopTracks = async (token, artistId) => {
        var url = GET_ARTIST_TOP_TRACKS;
        url = url.replace("{id}", artistId);
        return _request(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
    }

    // const _getRelatedArtists = async (token, artistId) => {
    //     var url = GET_RELATED_ARTISTS;
    //     url = url.replace("{id}", artistId);
    //     const result = await fetch(`${url}`, {
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + token }
    //     });

    //     const data = await result.json();

    //     return data;
    // }

    const _getTracks = async (token, tracksId) => {
        var url = GET_TRACKS;
        url = url.replace("{id}", tracksId);
        return _request(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
    }

    // const _getTracksAnalysis = async (token, tracksId) => {
    //     var url = GET_TRACKS_ANALYSIS;
    //     url = url.replace("{id}", tracksId);
    //     const result = await fetch(`${url}`, {
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + token }
    //     });

    //     const data = await result.json();

    //     return data;
    // }

    const _getArtistAlbums = async (token, artistId) => {
        var url = GET_ALBUMS;
        url = url.replace("{id}", artistId);
        const data = await _request(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!Array.isArray(data.items)) {
            throw new Error('Spotify returned an invalid album list.');
        }
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getArtists(token) {
            return _getArtists(token);
        },
        getArtist(token, artistId) {
            return _getArtist(token, artistId);
        },
        getArtistTopTracks(token, artistId) {
            return _getArtistTopTracks(token, artistId);
        },
        // getRelatedArtists(token, artistId) {
        //     return _getRelatedArtists(token, artistId);
        // },
        // getTracksAnalysis(token, tracksId) {
        //     return _getTracksAnalysis(token, tracksId);
        // },
        getArtistAlbums(token, artistId) {
            return _getArtistAlbums(token, artistId);
        },
        getTracks(token, tracksId) {
            return _getTracks(token, tracksId);
        }
    }
})();
