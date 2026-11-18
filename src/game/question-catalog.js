export const QUESTION_IDS = Object.freeze({
    POPULARITY: 'artist-popularity',
    FOLLOWERS: 'artist-followers',
    GENRES: 'artist-genres',
    TOP_TRACKS: 'artist-top-tracks',
    TRACK_RELEASE: 'track-release-date',
    TRACK_LENGTH: 'track-length',
    TRACK_POPULARITY: 'track-popularity',
    ALBUM_COUNT: 'artist-album-count',
    ALBUM_TRACK_COUNT: 'album-track-count',
    ALBUM_RELEASE: 'album-release-date'
});

export const QUESTION_TYPES = Object.freeze({
    MULTIPLE_CHOICE: 'multiple-choice',
    CHECKBOX_SELECTION: 'checkbox-selection'
});

export const QUESTION_CATALOG = Object.freeze({
    [QUESTION_IDS.POPULARITY]: {
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        setup: ({ ui, artist, mcSpot }) => ui.popularity(artist, mcSpot)
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
