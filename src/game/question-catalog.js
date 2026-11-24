export const QUESTION_IDS = Object.freeze({
    POPULARITY: 'artist-popularity',
    ARTIST_POPULARITY_RANKING: 'artist-popularity-ranking',
    FOLLOWERS: 'artist-followers',
    GENRES: 'artist-genres',
    TOP_TRACKS: 'artist-top-tracks',
    SONG_POPULARITY_RANKING: 'song-popularity-ranking',
    TRACK_RELEASE: 'track-release-date',
    TRACK_LENGTH: 'track-length',
    TRACK_POPULARITY: 'track-popularity',
    ALBUM_COUNT: 'artist-album-count',
    ALBUM_TRACK_COUNT: 'album-track-count',
    ALBUM_RELEASE: 'album-release-date'
});

export const QUESTION_TYPES = Object.freeze({
    MULTIPLE_CHOICE: 'multiple-choice',
    CHECKBOX_SELECTION: 'checkbox-selection',
    POPULARITY_MATCHING: 'popularity-matching'
});

function getSongPopularityItems(artistTopTen) {
    const tracks = Array.isArray(artistTopTen?.tracks) ? artistTopTen.tracks : [];
    return tracks.map(track => {
        const artists = Array.isArray(track?.artists)
            ? track.artists.map(trackArtist => trackArtist?.name).filter(Boolean).join(', ')
            : '';
        return {
            label: artists ? `${track?.name || 'Unknown track'} - ${artists}` : track?.name,
            popularity: track?.popularity
        };
    });
}

function createPopularityMatchingQuestion(items, prompt, requiredItemId) {
    return { items, prompt, requiredItemId };
}

export const QUESTION_CATALOG = Object.freeze({
    [QUESTION_IDS.POPULARITY]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artist, mcSpot }) => ui.popularity(artist, mcSpot)
    },
    [QUESTION_IDS.ARTIST_POPULARITY_RANKING]: {
        type: QUESTION_TYPES.POPULARITY_MATCHING,
        setup: ({ artist, popularityArtists = [] }) => createPopularityMatchingQuestion(
            [
                { id: artist?.id, label: artist?.name, popularity: artist?.popularity },
                ...popularityArtists.filter(candidate => candidate.id !== artist?.id)
            ],
            'Match each artist to its Spotify popularity score',
            artist?.id
        )
    },
    [QUESTION_IDS.FOLLOWERS]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artist, mcSpot }) => ui.followers(artist, mcSpot)
    },
    [QUESTION_IDS.GENRES]: {
        type: QUESTION_TYPES.CHECKBOX_SELECTION,
        setup: ({ ui, artist, recordAnswer }) => ui.genres(artist, recordAnswer)
    },
    [QUESTION_IDS.TOP_TRACKS]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artistTopTracks, artist, mcSpot }) =>
            ui.topTracks(artist, artistTopTracks, mcSpot)
    },
    [QUESTION_IDS.SONG_POPULARITY_RANKING]: {
        type: QUESTION_TYPES.POPULARITY_MATCHING,
        setup: ({ artistTopTen }) => createPopularityMatchingQuestion(
            getSongPopularityItems(artistTopTen),
            'Match each song to its Spotify popularity score'
        )
    },
    [QUESTION_IDS.TRACK_RELEASE]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artistTopTen, mcSpot }) => ui.trackRelease(artistTopTen, mcSpot)
    },
    [QUESTION_IDS.TRACK_LENGTH]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artistTopTen, mcSpot }) => ui.trackLength(artistTopTen, mcSpot)
    },
    [QUESTION_IDS.TRACK_POPULARITY]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artistTopTen, mcSpot }) => ui.trackPopularity(artistTopTen, mcSpot)
    },
    [QUESTION_IDS.ALBUM_COUNT]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, albums, artist, artistAlbums, mcSpot }) =>
            ui.albumCount(albums, artist, artistAlbums, mcSpot)
    },
    [QUESTION_IDS.ALBUM_TRACK_COUNT]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, albums, mcSpot, albumIndex }) =>
            ui.albumTrackCount(albums, mcSpot, albumIndex)
    },
    [QUESTION_IDS.ALBUM_RELEASE]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, albums, mcSpot, albumIndex }) =>
            ui.albumRelease(albums, mcSpot, albumIndex)
    }
});

export function getQuestionDefinition(questionId) {
    const definition = QUESTION_CATALOG[questionId];
    if (!definition) {
        throw new Error(`Unknown question: ${questionId}`);
    }
    return definition;
}

export function setupQuestion(questionId, context) {
    return getQuestionDefinition(questionId).setup(context);
}
