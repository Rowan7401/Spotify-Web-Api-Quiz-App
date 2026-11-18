import { QUESTION_IDS } from '../question-catalog.js';

export const CHOOSE_QUESTION_BUTTONS = Object.freeze([
    { buttonId: 'genres', questionId: QUESTION_IDS.GENRES },
    { buttonId: 'top-tracks', questionId: QUESTION_IDS.TOP_TRACKS },
    { buttonId: 'track-release', questionId: QUESTION_IDS.TRACK_RELEASE },
    { buttonId: 'track-length', questionId: QUESTION_IDS.TRACK_LENGTH },
    { buttonId: 'album-count', questionId: QUESTION_IDS.ALBUM_COUNT },
    { buttonId: 'album-tracks', questionId: QUESTION_IDS.ALBUM_TRACK_COUNT },
    { buttonId: 'album-release', questionId: QUESTION_IDS.ALBUM_RELEASE }
]);
