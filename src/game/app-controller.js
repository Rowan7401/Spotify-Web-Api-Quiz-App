import { APIController } from '../api/spotify-api.js';
import { UIController } from '../ui/ui-controller.js';
import { createStore } from './store.js';
import {
    getQuestionDefinition,
    QUESTION_IDS,
    QUESTION_TYPES,
    setupQuestion
} from './question-catalog.js';
import { configureQuestionInput } from './question-input.js';
import { CHOOSE_QUESTION_BUTTONS } from './modes/choose-question.js';
import { getFullTestQuestion } from './modes/full-test.js';
import { selectHotStreakQuestion } from './modes/hot-streak.js';

const APPController = (function (UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();
    const GRADE_THRESHOLDS = [
        [0.93, 'A'],
        [0.90, 'A-'],
        [0.87, 'B+'],
        [0.84, 'B'],
        [0.80, 'B-'],
        [0.77, 'C+'],
        [0.74, 'C'],
        [0.70, 'C-'],
        [0.67, 'D+'],
        [0.64, 'D'],
        [0.60, 'D-']
    ];

    function getGrade(percentage) {
        return GRADE_THRESHOLDS.find(([threshold]) => percentage >= threshold)?.[1] ?? 'F';
    }
    const q1 = document.getElementById('q1');
    const q2 = document.getElementById('q2');
    const q3 = document.getElementById('q3');
    const q4 = document.getElementById('q4');
    const genres = document.getElementById('genres');
    const top_tracks = document.getElementById('top-tracks');
    const track_release = document.getElementById('track-release');
    const track_length = document.getElementById('track-length');
    const album_count = document.getElementById('album-count');
    const album_tracks = document.getElementById('album-tracks');
    const album_release = document.getElementById('album-release');
    const ABtn = document.getElementById('Abtn');
    const BBtn = document.getElementById('Bbtn');
    const CBtn = document.getElementById('Cbtn');
    const DBtn = document.getElementById('Dbtn');
    const answerButtons = [ABtn, BBtn, CBtn, DBtn];
    const submit = document.getElementById('submit');
    const reset_btn = document.getElementById('reset-btn');
    const choose = document.getElementById('prompt-title');
    const dismiss_btn = document.getElementById('dismiss-popup-btn');
    const play_again_btn = document.getElementById('play-again-btn');
    const hsbtn = document.getElementById('hsbtn');
    const testbtn = document.getElementById('testbtn');
    const chbtn = document.getElementById('chbtn');

    const gameStore = createStore({
        score: { correct: 0, incorrect: 0 },
        artistSelected: false,
        mode: null,
        phase: 'artist-selection',
        questionIndex: 0,
        isFinalQuestion: false,
        questionSkipped: false
    });

    function updateGameState(updates) {
        gameStore.update(state => ({ ...state, ...updates }));
    }

    function recordAnswer(isCorrect) {
        const { score } = gameStore.getState();
        const scoreKey = isCorrect ? 'correct' : 'incorrect';
        updateGameState({ score: { ...score, [scoreKey]: score[scoreKey] + 1 } });
    }

    function resetScore() {
        updateGameState({ score: { correct: 0, incorrect: 0 } });
    }

    function getScore() {
        return gameStore.getState().score;
    }


    var i = 0;
    var random_nums = [];
    var n = 11;
    do {
        const randomNumber = Math.floor(Math.random() * 11);
        if (!random_nums.includes(randomNumber)) {
            random_nums.push(randomNumber);
        }

    } while (random_nums.length < n);

    document.getElementById("prompt").textContent = `Choose your quiz game mode`;

    // get artists on page load
    const loadArtist = async () => {

        document.getElementsByClassName("dropdown")[0].classList.add("active");
        document.getElementsByClassName("reset-page")[0].classList.remove("active");

        q1.style.display = "none";
        q2.style.display = "none";
        q3.style.display = "none";
        q4.style.display = "none";

        genres.style.display = "none";
        top_tracks.style.display = "none";
        track_release.style.display = "none";
        track_length.style.display = "none";
        album_count.style.display = "none";
        album_tracks.style.display = "none";
        album_release.style.display = "none";
        
        document.getElementById("checkbox1").parentNode.style.display = 'none';
        document.getElementById("checkbox2").parentNode.style.display = 'none';
        document.getElementById("checkbox3").parentNode.style.display = 'none';
        document.getElementById("checkbox4").parentNode.style.display = 'none';

        ABtn.style.display = 'none';
        BBtn.style.display = 'none';
        CBtn.style.display = 'none';
        DBtn.style.display = 'none';

        //get the token
        try {
            const token = await APICtrl.getToken();
            UICtrl.storeToken(token);
            const artists = await APICtrl.getArtists(token);
            if (artists.length === 0) {
                throw new Error('Spotify did not return any artists.');
            }
            UICtrl.createDropdown();
            artists.forEach(element => {
                if (element && element.name && element.id) {
                    UICtrl.createArtist(element.name, element.id);
                }
            });
            UICtrl.showStatus('');
        } catch (error) {
            UICtrl.showStatus(`Unable to load Spotify artists. ${error.message}`, true);
        }

    }

    reset_btn.addEventListener("click", resetPage);

    function resetPage() {
        location.reload();
    }

    function playAgainHotStreak() {
        resetScore();
        updateGameState({ mode: 'hot-streak', phase: 'question', questionSkipped: false });

        document.getElementsByClassName("reset-page")[0].classList.remove("active");
        document.getElementsByClassName("question")[0].classList.add("active");
        UICtrl.removeAlbumImage();
        document.getElementById("score").textContent = ``;

        console.log(getScore())
        hotStreakQuestion();
    }
    function playAgainTest() {
        resetScore();
        updateGameState({
            mode: 'full-test',
            phase: 'question',
            questionIndex: 0,
            isFinalQuestion: false,
            questionSkipped: false
        });
        i = 0;

        document.getElementsByClassName("reset-page")[0].classList.remove("active");
        document.getElementsByClassName("question")[0].classList.add("active");
        document.getElementById("score").textContent = ``;
        UICtrl.removeAlbumImage();

        console.log(getScore())
        fullTest();
    }

    var artist;
    var artistTopTracks;
    var relatedArtists;
    var artistTopTen;
    var artistTopTenAnalysis;
    var artistAlbums;
    var albums = [];
    var album_names = [];
    var randomAlbumIndex;

    function setupGameQuestion(questionId, mcSpot) {
        return setupQuestion(questionId, {
            ui: UICtrl,
            artist,
            artistTopTracks,
            artistTopTen,
            artistAlbums,
            albums,
            albumIndex: randomAlbumIndex,
            mcSpot,
            recordAnswer
        });
    }

    DOMInputs.artist.addEventListener('change', async () => {
        updateGameState({ artistSelected: false });
        UICtrl.showStatus('Loading artist details...');
        try {
            const token = UICtrl.getStoredToken().token;
            const artistId = UICtrl.inputField().artist.value;
            const selectedArtist = await APICtrl.getArtist(token, artistId);
            if (!selectedArtist || typeof selectedArtist !== 'object') {
                throw new Error('Spotify returned an invalid artist response.');
            }

            let selectedArtistTopTracks = { tracks: [] };
            try {
                selectedArtistTopTracks = await APICtrl.getArtistTopTracks(token, artistId);
            } catch (error) {
                console.error('Unable to load Spotify top tracks:', error);
            }
            const topTracks = Array.isArray(selectedArtistTopTracks?.tracks)
                ? selectedArtistTopTracks.tracks
                : [];

            const tracksId = topTracks.filter(track => track?.id).slice(0, 10).map(track => track.id).join('%2C');
            let selectedArtistTopTen = { tracks: [] };
            if (tracksId) {
                try {
                    selectedArtistTopTen = await APICtrl.getTracks(token, tracksId);
                } catch (error) {
                    console.error('Unable to load Spotify track details:', error);
                }
            }
            const tracks = Array.isArray(selectedArtistTopTen?.tracks)
                ? selectedArtistTopTen.tracks
                : [];

            let selectedArtistAlbums = { items: [] };
            try {
                selectedArtistAlbums = await APICtrl.getArtistAlbums(token, artistId);
            } catch (error) {
                console.error('Unable to load Spotify albums:', error);
            }
            const selectedAlbums = Array.isArray(selectedArtistAlbums?.items)
                ? selectedArtistAlbums.items.filter(album => album && typeof album === 'object')
                : [];

            artist = { ...selectedArtist, name: selectedArtist.name || 'this artist' };
            artistTopTracks = { tracks: topTracks };
            artistTopTen = { tracks };
            artistAlbums = { ...selectedArtistAlbums, items: selectedAlbums };
            albums = selectedAlbums;
            album_names = selectedAlbums.map(album => album.name);

            var imageUrl = UICtrl.getImageUrl(artist.images);
            UICtrl.createArtistImage(imageUrl, artist.name);

            document.getElementsByClassName("dropdown")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");
            document.getElementsByClassName("chooseGame")[0].classList.add("active");

            choose.style.display = "none";
            updateGameState({ artistSelected: true });
            UICtrl.showStatus('');
        } catch (error) {
            UICtrl.showStatus(`Unable to load this artist. ${error.message}`, true);
        }
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function waitForAnswer(buttons) {
        return new Promise(resolve => {
            const handleAnswer = event => {
                buttons.forEach(button => button.removeEventListener('click', handleAnswer));
                resolve(event.currentTarget);
            };

            buttons.forEach(button => button.addEventListener('click', handleAnswer));
        });
    }

    function checkHotStreakAnswer() {
        if (getScore().incorrect == 0) {
            console.log("Correct")
            hotStreakPopup();
        }
        else {
            console.log("lost");
            hotStreakPopup();
        }
    }

    async function chooseQuestions() {
        var correct = false;
        var qType = false;

        document.getElementsByClassName("album-detail")[0].classList.remove("active");
        document.getElementsByClassName("artist-detail")[0].classList.add("active");

        genres.style.display = "unset";
        top_tracks.style.display = "unset";
        track_release.style.display = "unset";
        track_length.style.display = "unset";
        album_count.style.display = "unset";
        album_tracks.style.display = "unset";
        album_release.style.display = "unset";

        const handlersByQuestionId = new Map([
            [QUESTION_IDS.GENRES, GenresClick],
            [QUESTION_IDS.TOP_TRACKS, TopTracksClick],
            [QUESTION_IDS.TRACK_RELEASE, TrackReleaseClick],
            [QUESTION_IDS.TRACK_LENGTH, TrackLengthClick],
            [QUESTION_IDS.ALBUM_COUNT, AlbumCountClick],
            [QUESTION_IDS.ALBUM_TRACK_COUNT, AlbumTracksClick],
            [QUESTION_IDS.ALBUM_RELEASE, AlbumReleaseClick]
        ]);
        CHOOSE_QUESTION_BUTTONS.forEach(({ buttonId, questionId }) => {
            document.getElementById(buttonId).addEventListener('click', handlersByQuestionId.get(questionId));
        });


        function AClick(event) {
            if (mc_spots == 0) {
                recordAnswer(true);
                correct = true;
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkChooseQAnswer(correct);
        }
        function BClick(event) {
            if (mc_spots == 1) {
                recordAnswer(true);
                correct = true;
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkChooseQAnswer(correct);
        }
        function CClick(event) {
            if (mc_spots == 2) {
                recordAnswer(true);
                correct = true;
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkChooseQAnswer(correct);
        }
        function DClick(event) {
            if (mc_spots == 3) {
                recordAnswer(true);
                correct = true;
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkChooseQAnswer(correct);
        }

        function skipUnavailableQuestion() {
            updateGameState({ questionSkipped: true });
            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);
            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.remove("active");
            document.getElementsByClassName("question")[0].classList.add("active");
            checkChooseQAnswer(false);
        }

        async function GenresClick(event) {
            qType = getQuestionDefinition(QUESTION_IDS.GENRES).type;
            console.log("genres clicked")

            document.getElementsByClassName("question")[0].classList.add("active");
            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");

            var old_correct = getScore().correct;

            if (setupGameQuestion(QUESTION_IDS.GENRES, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            
            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            for (let i = 0; i < 50; i++) {
                var qbox_active = document.getElementsByClassName('qbox active').length > 0;
                if (qbox_active) {
                    console.log(`Waiting ${i / 2} seconds...`);
                    await sleep(i * 500);
                }
                else {
                    break;
                }
                
            }
            var new_correct = getScore().correct;
            if (new_correct > old_correct) {
                correct = true;
            }
            checkChooseQAnswer(correct);
                        
        }
        function TopTracksClick(event) {
            console.log("top tracks clicked")
            qType = getQuestionDefinition(QUESTION_IDS.TOP_TRACKS).type;
            if (setupGameQuestion(QUESTION_IDS.TOP_TRACKS, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            document.getElementsByClassName("question")[0].classList.add("active");

            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");
        }
        function TrackReleaseClick(event) {
            console.log("track release clicked")
            qType = getQuestionDefinition(QUESTION_IDS.TRACK_RELEASE).type;
            if (setupGameQuestion(QUESTION_IDS.TRACK_RELEASE, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            document.getElementsByClassName("question")[0].classList.add("active");

            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");
        }
        function TrackLengthClick(event) {
            qType = getQuestionDefinition(QUESTION_IDS.TRACK_LENGTH).type;
            if (setupGameQuestion(QUESTION_IDS.TRACK_LENGTH, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            document.getElementsByClassName("question")[0].classList.add("active");

            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");
        }
        function AlbumCountClick(event) {
            qType = getQuestionDefinition(QUESTION_IDS.ALBUM_COUNT).type;
            if (setupGameQuestion(QUESTION_IDS.ALBUM_COUNT, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            document.getElementsByClassName("question")[0].classList.add("active");

            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");
        }
        function AlbumTracksClick(event) {
            qType = getQuestionDefinition(QUESTION_IDS.ALBUM_TRACK_COUNT).type;
            if (setupGameQuestion(QUESTION_IDS.ALBUM_TRACK_COUNT, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            document.getElementsByClassName("question")[0].classList.add("active");

            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");
        }
        function AlbumReleaseClick(event) {
            qType = getQuestionDefinition(QUESTION_IDS.ALBUM_RELEASE).type;
            if (setupGameQuestion(QUESTION_IDS.ALBUM_RELEASE, mc_spots) === false) {
                skipUnavailableQuestion();
                return;
            }
            setQuestionBoxType(qType, AClick, BClick, CClick, DClick)
            document.getElementsByClassName("question")[0].classList.add("active");

            genres.removeEventListener("click", GenresClick);
            top_tracks.removeEventListener("click", TopTracksClick);
            track_release.removeEventListener("click", TrackReleaseClick);
            track_length.removeEventListener("click", TrackLengthClick);
            album_count.removeEventListener("click", AlbumCountClick);
            album_tracks.removeEventListener("click", AlbumTracksClick);
            album_release.removeEventListener("click", AlbumReleaseClick);

            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");
        }
     
        var mc_spots = Math.floor(Math.random() * 4);

        if (albums.length != 0) {
            randomAlbumIndex = Math.floor(Math.random() * albums.length);
            UICtrl.createAlbumImage(UICtrl.getImageUrl(albums[randomAlbumIndex].images), albums[randomAlbumIndex].name);
        }

    }

    function setQuestionBoxType(type, AClick, BClick, CClick, DClick) {
        configureQuestionInput(type, {
            questionChoices: [q1, q2, q3, q4],
            answerButtons,
            checkboxes: [1, 2, 3, 4].map(index => document.getElementById(`checkbox${index}`)),
            submitButton: submit
        });

        if (type === QUESTION_TYPES.MULTIPLE_CHOICE) {
            [ABtn, BBtn, CBtn, DBtn].forEach((button, index) => {
                button.addEventListener('click', [AClick, BClick, CClick, DClick][index]);
            });
            document.getElementById('fire').textContent = '🔥';
        }
    }

    function checkChooseQAnswer(correct) {
        if (gameStore.getState().questionSkipped) {
            document.getElementById("popup-title").textContent = `Question skipped`;
            document.getElementById("fire").textContent = `ℹ️`;
            chooseQAnswerPopUp();
        }
        else if (correct) {
            console.log("Correct")
            document.getElementById("popup-title").textContent = `Correct!!`;
            document.getElementById("fire").textContent = `✅`
            chooseQAnswerPopUp();
        }
        else {
            console.log("Incorrect");
            document.getElementById("popup-title").textContent = `Incorrect!!`;
            document.getElementById("fire").textContent = `❌`
            chooseQAnswerPopUp();
        }
    }

    async function hotStreakQuestion() {
        updateGameState({ questionSkipped: false });
        let questionAvailable = true;
        const questionId = selectHotStreakQuestion();
        const questionType = getQuestionDefinition(questionId).type;
        document.getElementsByClassName("qbox")[0].classList.add("active");
        var mc_spots = Math.floor(Math.random() * 4);

        if (albums.length != 0) {
            randomAlbumIndex = Math.floor(Math.random() * albums.length);
            UICtrl.createAlbumImage(UICtrl.getImageUrl(albums[randomAlbumIndex].images), albums[randomAlbumIndex].name);
        }

        questionAvailable = setupGameQuestion(questionId, mc_spots) !== false;

        if (!questionAvailable) {
            updateGameState({ questionSkipped: true });
            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkHotStreakAnswer();
            return;
        }

        setQuestionBoxType(questionType, AClick, BClick, CClick, DClick);


        function AClick(event) {
            if (mc_spots == 0) {
                recordAnswer(true);
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }
        function BClick(event) {
            if (mc_spots == 1) {
                recordAnswer(true);
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }
        function CClick(event) {
            if (mc_spots == 2) {
                recordAnswer(true);
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }
        function DClick(event) {
            if (mc_spots == 3) {
                recordAnswer(true);
            }
            else {
                recordAnswer(false);
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }

        for (let i = 0; i < 12; i++) {
            var qbox_active = document.getElementsByClassName('qbox active').length > 0;
            if (qbox_active) {
                console.log(`Waiting ${i / 2} seconds...`);
                await sleep(i * 500);
            }
            else {
                checkHotStreakAnswer();
                break;
            }

        }

        if (qbox_active) {
            recordAnswer(false);
            checkHotStreakAnswer();
        }


    }

    function fullTest() {
        const sel_question = gameStore.getState().questionIndex;
        updateGameState({
            questionIndex: sel_question + 1,
            isFinalQuestion: sel_question === 13,
            phase: 'question'
        });
        fullTestQuestion(sel_question);
    }

    async function fullTestQuestion(sel_question) {
        updateGameState({ questionSkipped: false });
        let questionAvailable = true;
        document.getElementsByClassName("qbox")[0].classList.add("active");
        const mc_spots = Math.floor(Math.random() * 4);
        let correctAnswer = false;
        const questionId = getFullTestQuestion(sel_question);
        if (!questionId) {
            throw new RangeError(`No full-test question at index ${sel_question}`);
        }
        const questionType = getQuestionDefinition(questionId).type;

        if (albums.length != 0) {
            randomAlbumIndex = Math.floor(Math.random() * albums.length);
            UICtrl.createAlbumImage(UICtrl.getImageUrl(albums[randomAlbumIndex].images), albums[randomAlbumIndex].name);
        }

        questionAvailable = setupGameQuestion(questionId, mc_spots) !== false;

        if (!questionAvailable) {
            updateGameState({ questionSkipped: true, phase: 'feedback' });
            document.getElementsByClassName("qbox")[0].classList.remove("active");
            fullTestPopup();
            return;
        }

        const checkboxQuestion = questionType === QUESTION_TYPES.CHECKBOX_SELECTION;
        configureQuestionInput(questionType, {
            questionChoices: [q1, q2, q3, q4],
            answerButtons,
            checkboxes: [1, 2, 3, 4].map(index => document.getElementById(`checkbox${index}`)),
            submitButton: submit
        });

        if (checkboxQuestion) {
            const previousCorrect = getScore().correct;
            await waitForAnswer([submit]);
            correctAnswer = getScore().correct > previousCorrect;
        } else {
            const selectedButton = await waitForAnswer(answerButtons);
            correctAnswer = answerButtons.indexOf(selectedButton) === mc_spots;
            recordAnswer(correctAnswer);
            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }

        if (!checkboxQuestion) {
            if (correctAnswer) {
                document.getElementById("popup-title").textContent = `Correct! Good job!`;
                document.getElementById("fire").textContent = `✅`
            }
            else {
                document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                document.getElementById("fire").textContent = `❌`
            }

        }
        updateGameState({ phase: 'feedback' });
        fullTestPopup();
    }

    function hotStreakPopup() {
        document.getElementsByClassName("popup-center")[0].classList.add("active");

        UIController.appendScore(` Hot Streak of ${getScore().correct}!`);

        dismiss_btn.addEventListener("click", dismissPopup);

        if (getScore().incorrect != 0) {
            document.getElementById("score").textContent = `Final Score: Hot Streak of ${getScore().correct}!`;
            document.getElementById("dismiss-popup-btn").textContent = `Dismiss`;
            if (getScore().correct < 5) {
                document.getElementById("popup-title").textContent = `🧊Game Over!🧊 Cold round...`;
            }
            else {
                document.getElementById("popup-title").textContent = `🔥Game Over!🔥 You were on fire!`;
            }

        }
        else {
            document.getElementById("dismiss-popup-btn").textContent = `Next Question`;
            document.getElementById("popup-title").textContent = gameStore.getState().questionSkipped ? `Question skipped` : `Correct!!`;
        }

        function dismissPopup() {
            if (getScore().incorrect == 0) {
                document.getElementById("score").textContent = ``;
                dismiss_btn.removeEventListener("click", dismissPopup);
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                UICtrl.removeAlbumImage();
                updateGameState({ questionSkipped: false });
                hotStreakQuestion();
            }
            else {
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                document.getElementsByClassName("question")[0].classList.remove("active");
                document.getElementsByClassName("reset-page")[0].classList.add("active");
                dismiss_btn.removeEventListener("click", dismissPopup);
            }

        }
        console.log(getScore());

    }

    function fullTestPopup() {
        document.getElementsByClassName("popup-center")[0].classList.add("active");

        var totalQ = getScore().correct + getScore().incorrect;

        UIController.appendScore(` Score: ${getScore().correct}/${totalQ} answered`);

        dismiss_btn.addEventListener("click", dismissPopup);
        if (gameStore.getState().questionSkipped) {
            document.getElementById("popup-title").textContent = `Question skipped`;
            document.getElementById("fire").textContent = `ℹ️`;
        }

        var percentageRaw = totalQ === 0 ? 0 : getScore().correct / totalQ;
        var percentage = Math.round(percentageRaw * 10000) / 100;

        const { isFinalQuestion, questionSkipped } = gameStore.getState();
        if (isFinalQuestion) {
            if (totalQ === 0) {
                document.getElementById("popup-title").textContent = `No score: Spotify did not provide data for any questions.`;
            }
            else {
                document.getElementById("popup-title").textContent =
                    ` Grade: [${getGrade(percentageRaw)}] Final score: ${percentage}%`;
            }
            if (questionSkipped && totalQ > 0) {
                document.getElementById("popup-title").textContent += ` (question skipped)`;
            }
            document.getElementById("dismiss-popup-btn").textContent = `Dismiss`;

        }
        else {
            document.getElementById("dismiss-popup-btn").textContent = `Next Question`;
        }

        function dismissPopup() {
            if (!gameStore.getState().isFinalQuestion) {
                document.getElementById("score").textContent = ``;
                dismiss_btn.removeEventListener("click", dismissPopup);
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                UICtrl.removeAlbumImage();
                updateGameState({ questionSkipped: false });
                fullTest();
            }
            else {
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                document.getElementsByClassName("question")[0].classList.remove("active");
                document.getElementsByClassName("reset-page")[0].classList.add("active");
                dismiss_btn.removeEventListener("click", dismissPopup);
                updateGameState({ questionSkipped: false, phase: 'complete' });
            }

        }
        console.log(getScore());

    }

    function chooseQAnswerPopUp() {
        document.getElementsByClassName("popup-center")[0].classList.add("active");

        UIController.appendScore(` Score ${getScore().correct} / ${getScore().incorrect + getScore().correct}!`);

        dismiss_btn.addEventListener("click", dismissPopup);
   
        document.getElementById("dismiss-popup-btn").textContent = `Next Question`;

        function dismissPopup() {
            document.getElementById("score").textContent = ``;
            UICtrl.removeAlbumImage();
            dismiss_btn.removeEventListener("click", dismissPopup);
            document.getElementsByClassName("popup-center")[0].classList.remove("active");
            
            document.getElementsByClassName("question")[0].classList.remove("active");
            document.getElementsByClassName("chooseQ-game")[0].classList.add("active");

            updateGameState({ questionSkipped: false });
            chooseQuestions();
            
        }
        console.log(getScore());

    }

    hsbtn.addEventListener('click', event => {
        if (gameStore.getState().artistSelected) {
            updateGameState({ mode: 'hot-streak', phase: 'question' });
            document.getElementsByClassName("chooseGame")[0].classList.remove("active");
            document.getElementsByClassName("question")[0].classList.add("active");

            play_again_btn.addEventListener("click", playAgainHotStreak);

            hotStreakQuestion();
        }
        else {
            alert("You need to choose an artist first.")
        }
    });

    testbtn.addEventListener('click', event => {
        if (gameStore.getState().artistSelected) {
            updateGameState({
                mode: 'full-test',
                phase: 'question',
                questionIndex: 0,
                isFinalQuestion: false,
                questionSkipped: false
            });
            document.getElementsByClassName("chooseGame")[0].classList.remove("active");
            document.getElementsByClassName("question")[0].classList.add("active");

            play_again_btn.addEventListener("click", playAgainTest);

            fullTest();
        }
        else {
            alert("You need to choose an artist first.")
        }
    });

    chbtn.addEventListener('click', event => {
        if (gameStore.getState().artistSelected) {
            updateGameState({ mode: 'choose-question', phase: 'question' });
            document.getElementsByClassName("chooseGame")[0].classList.remove("active");
            document.getElementsByClassName("chooseQ-game")[0].classList.add("active");

            play_again_btn.addEventListener("click", playAgainTest);

            chooseQuestions();
        }
        else {
            alert("You need to choose an artist first.")
        }
    });


    return {

        init() {
            console.log('App is starting');
            loadArtist();
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();
