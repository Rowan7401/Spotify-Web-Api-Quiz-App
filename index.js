// const axios = require("axios");
// const express = require("express");
// const cors = require("cors")

// const app = express();


const API_TOKEN_URL = "https://accounts.spotify.com/api/token";
const GET_SEVERAL_ARTISTS = "https://api.spotify.com/v1/artists?ids=4Gso3d4CscCijv0lmajZWs%2C3qiHUAX7zY4Qnjx8TNUzVx"
const GET_ARTIST = `https://api.spotify.com/v1/artists/{{artistId}}`


// app.use(
//     cors({
//         origin: "*",
//         credentials: true,
//     })
// );

const APIController = (function () {

    const clientId = '1d496acbb5d74fda83a986827c69c234';
    const clientSecret = 'f677cbd0d9de483f9cd86e27a31d5e0b';

    // private methods
    const _getToken = async () => {

        const result = await fetch(`${API_TOKEN_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getArtists = async (token) => {

        const result = await fetch(`${GET_SEVERAL_ARTISTS}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();

        return data.artists;
    }

    const _getArtist = async (token, artistId) => {
        const url = GET_ARTIST.replace("{{artistId}}", artistId);
        const result = await fetch(`${url}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();

        return data;
    }

    const _getArtistTopTracks = async (token, artistId) => {
        var url = "https://api.spotify.com/v1/artists/{id}/top-tracks?market=US";
        url = url.replace("{id}", artistId);
        const result = await fetch(`${url}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();

        return data;
    }

    const _getRelatedArtists = async (token, artistId) => {
        var url = "https://api.spotify.com/v1/artists/{id}/related-artists";
        url = url.replace("{id}", artistId);
        const result = await fetch(`${url}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();

        return data;
    }

    const _getTracksAnalysis = async (token, tracksId) => {
        var url = "https://api.spotify.com/v1/audio-features?ids{id}";
        url = url.replace("{id}", trackId);
        const result = await fetch(`${url}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();

        return data;
    }

    const _getTracks = async (token, tracksId) => {
        var url = "https://api.spotify.com/v1/tracks?market=US&ids={id}";
        url = url.replace("{id}", tracksId);
        const result = await fetch(`${url}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();

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
        getRelatedArtists(token, artistId) {
            return _getRelatedArtists(token, artistId);
        },
        getTracksAnalysis(token, tracksId) {
            return _getTracksAnalysis(token, tracksId);
        },
        getTracks(token, tracksId) {
            return _getTracks(token, tracksId);
        }
    }
})();


const UIController = (function () {

    //object to hold references to html selectors
    const DOMElements = {
        hfToken: '#hidden_token',
        selectArtist: '#select_artist',
        divRanking: '#artist-ranking',
        divArtistDetail: '#artist-detail'
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                artist: document.querySelector(DOMElements.selectArtist),
                ranking: document.querySelector(DOMElements.divRanking),
                ArtistDetail: document.querySelector(DOMElements.divArtistDetail)

            }
        },

        // need methods to create select list option
        createDropdown(text, value) {
            const html = `<option value ="${null}">Select an artist from the dropdown...`;
            return document.querySelector(DOMElements.selectArtist).insertAdjacentHTML('beforeend', html);
        },
        createArtist(text, value) {
            const html = `<option value ="${value}">${text}`;
            return document.querySelector(DOMElements.selectArtist).insertAdjacentHTML('beforeend', html);
        },
        resetArtist() {
            UIController.inputField().artist.innerHTML = '';
        },
        createArtistImage(img, name) {

            const detailDiv = document.querySelector(DOMElements.divArtistDetail);

            const html = `

            <span class="artistHeader">${name}:</span>

            <div class="form-label col-sm-12 px-0">
                <img src="${img}" alt="artist_pic">
            </div>
            
                
            `;
            document.querySelector(DOMElements.divArtistDetail).insertAdjacentHTML("beforeend", html)
        },
        resetArtistImage() {
            UIController.inputField().ArtistDetail.innerHTML = '';
        },
        hotStreakRanking(artist, score_board) {
            document.getElementById("hot-streak-q").innerHTML = `What is this artist's worldwide ranking on spotify?`;

            var mc_spots = Math.floor(Math.random() * 4);

            var ABtn = document.getElementById("Abtn");
            var BBtn = document.getElementById("Bbtn");
            var CBtn = document.getElementById("Cbtn");
            var DBtn = document.getElementById("Dbtn");
            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick);
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick); 

            function AClick(event) {
                if (mc_spots == 0) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function BClick(event) {
                if (mc_spots == 1) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function CClick(event) {
                if (mc_spots == 2) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function DClick(event) {
                if (mc_spots == 3) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }

            var real_ranking = `${artist.popularity}`;
            var fake_rank1 = Math.floor(Math.random() * 500);
            var fake_rank2 = Math.floor(Math.random() * 500);
            var fake_rank3 = Math.floor(Math.random() * 500);
            const answers = [real_ranking, fake_rank1, fake_rank2, fake_rank3];

            if (mc_spots == 0) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots + 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 3]];
            }
            else if (mc_spots == 1) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 1]];
            }
            else if (mc_spots == 2) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots - 2], "D: " + answers[mc_spots + 1]];
            }
            else {
                var mc = ["A: " + answers[mc_spots - 2], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots], "D: " + answers[mc_spots - 3]];
            }


            document.getElementById("q1").innerHTML = `${mc[0]}`;
            document.getElementById("q2").innerHTML = `${mc[1]}`;
            document.getElementById("q3").innerHTML = `${mc[2]}`;
            document.getElementById("q4").innerHTML = `${mc[3]}`;

            return score_board;

        },
        hotStreakFollowers(artist, score_board) {
            document.getElementById("hot-streak-q").innerHTML = `How many followers on Spotify does this artist have?`;

            var mc_spots = Math.floor(Math.random() * 4);

            var ABtn = document.getElementById("Abtn");
            var BBtn = document.getElementById("Bbtn");
            var CBtn = document.getElementById("Cbtn");
            var DBtn = document.getElementById("Dbtn");
            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick);
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick); 

            function AClick(event) {
                if (mc_spots == 0) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function BClick(event) {
                if (mc_spots == 1) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function CClick(event) {
                if (mc_spots == 2) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function DClick(event) {
                if (mc_spots == 3) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }

            var followers = `${artist.followers.total}`;
            var real_followers = parseInt(followers);
            var fake_followers1 = Math.floor(Math.random() * real_followers);
            var fake_followers2 = (Math.floor(Math.random() * real_followers) + 1000000);
            var fake_followers3 = Math.floor(Math.random() * real_followers);

            real_followers = real_followers.toLocaleString('en-US')
            fake_followers1 = fake_followers1.toLocaleString('en-US')
            fake_followers2 = fake_followers2.toLocaleString('en-US')
            fake_followers3 = fake_followers3.toLocaleString('en-US')
            const answers = [real_followers, fake_followers1, fake_followers2, fake_followers3];

            if (mc_spots == 0) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots + 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 3]];
            }
            else if (mc_spots == 1) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 1]];
            }
            else if (mc_spots == 2) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots - 2], "D: " + answers[mc_spots + 1]];
            }
            else {
                var mc = ["A: " + answers[mc_spots - 2], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots], "D: " + answers[mc_spots - 3]];
            }


            document.getElementById("q1").innerHTML = `${mc[0]}`;
            document.getElementById("q2").innerHTML = `${mc[1]}`;
            document.getElementById("q3").innerHTML = `${mc[2]}`;
            document.getElementById("q4").innerHTML = `${mc[3]}`;

            return score_board;

        },
        hotStreakGenres(artist, score_board) {
            submit = document.getElementById('submit');
            submit.style.display = "unset";
            document.getElementById("hot-streak-q").innerHTML = `What genre(s) does Spotify not label this artist with?`;

            document.getElementById("checkbox1").parentNode.style.display = 'unset';
            document.getElementById("checkbox2").parentNode.style.display = 'unset';
            document.getElementById("checkbox3").parentNode.style.display = 'unset';
            document.getElementById("checkbox4").parentNode.style.display = 'unset';

            if (artist.genres.length == 1) {
                var real_genres = [artist.genres[0]];
            }
            else if (artist.genres.length == 2) {
                var real_genres = [artist.genres[0], artist.genres[1]];
            }
            else {
                var real_genres = [artist.genres[0], artist.genres[1], artist.genres[2]];
            }

            const random_genres = ["canadian hip hop", "canadian trap", "hip hop", "melodic rap", "rap", "toronto rap", "trap",
                "vapor trap", "pop", "alternative rock", "grunge", "permanent wave", "rock", "alternative r&b", "viral pop", "indonesian r&b",
                "indonesian hip hop"];

            var difference = random_genres.filter(x => real_genres.indexOf(x) === -1);

            var genre1 = real_genres[0];
            var genre4 = difference[Math.floor(Math.random() * difference.length)]
            if (artist.genres.length == 1) {
                var genre2 = difference[Math.floor(Math.random() * difference.length)];
                var genre3 = difference[Math.floor(Math.random() * difference.length)];
            }
            else if (artist.genres.length == 2) {
                var genre2 = real_genres[1];
                var genre3 = difference[Math.floor(Math.random() * difference.length)];
            }
            else {
                var genre2 = real_genres[1];
                var genre3 = real_genres[2];
            }

            var mc = ["A: " + genre1, "B: " + genre2, "C: " + genre3, "D: " + genre4];

            document.getElementById('label1').innerHTML = `${mc[0]}`;
            document.getElementById('label2').innerHTML = `${mc[1]}`;
            document.getElementById('label3').innerHTML = `${mc[2]}`;
            document.getElementById('label4').innerHTML = `${mc[3]}`;

            submit.addEventListener('click', event => {
                if (artist.genres.length == 1) {
                    if (document.getElementById("checkbox2").checked
                        && document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox4").checked
                        && document.getElementById("checkbox1").checked == false) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }
                else if (artist.genres.length == 2) {
                    if (document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox4").checked
                        && document.getElementById("checkbox1").checked == false
                        && document.getElementById("checkbox2").checked == false) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }
                else {
                    if (document.getElementById("checkbox4").checked && document.getElementById("checkbox1").checked == false
                        && document.getElementById("checkbox2").checked == false && document.getElementById("checkbox3").checked == false) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }
                submit.style.display = "none";
                document.getElementById("checkbox1").parentNode.style.display = 'none';
                document.getElementById("checkbox2").parentNode.style.display = 'none';
                document.getElementById("checkbox3").parentNode.style.display = 'none';
                document.getElementById("checkbox4").parentNode.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            });

            return score_board;
        },
        hotStreakTopTracks(artist, score_board) {
            document.getElementById("hot-streak-q").innerHTML = `What are this artist's hottest 3 tracks currently?`;
            var mc_spots = Math.floor(Math.random() * 4);

            var ABtn = document.getElementById("Abtn");
            var BBtn = document.getElementById("Bbtn");
            var CBtn = document.getElementById("Cbtn");
            var DBtn = document.getElementById("Dbtn");
            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick);
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick); 

            function AClick(event) {
                if (mc_spots == 0) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function BClick(event) {
                if (mc_spots == 1) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function CClick(event) {
                if (mc_spots == 2) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function DClick(event) {
                if (mc_spots == 3) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }

            var top_tracks = [artist.tracks[0].name, artist.tracks[1].name, artist.tracks[2].name, artist.tracks[3].name,
            artist.tracks[4].name, artist.tracks[5].name, artist.tracks[6].name, artist.tracks[7].name, artist.tracks[8].name,
            artist.tracks[9].name];

            var random_nums = [];
            var n = 9;
            do {
                const randomNumber = Math.floor(Math.random() * 10);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            var top_three = top_tracks[0] + ", " + top_tracks[1] + ", " + top_tracks[2];
            var fake_three1 = top_tracks[random_nums[0]] + ", " + top_tracks[random_nums[1]]
                + ", " + top_tracks[random_nums[2]];
            var fake_three2 = top_tracks[random_nums[3]] + ", " + top_tracks[random_nums[4]]
                + ", " + top_tracks[random_nums[5]];
            var fake_three3 = top_tracks[random_nums[6]] + ", " + top_tracks[random_nums[7]]
                + ", " + top_tracks[8];



            const answers = [top_three, fake_three1, fake_three2, fake_three3];

            if (mc_spots == 0) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots + 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 3]];
            }
            else if (mc_spots == 1) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 1]];
            }
            else if (mc_spots == 2) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots - 2], "D: " + answers[mc_spots + 1]];
            }
            else {
                var mc = ["A: " + answers[mc_spots - 2], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots], "D: " + answers[mc_spots - 3]];
            }


            document.getElementById("q1").innerHTML = `${mc[0]}`;
            document.getElementById("q2").innerHTML = `${mc[1]}`;
            document.getElementById("q3").innerHTML = `${mc[2]}`;
            document.getElementById("q4").innerHTML = `${mc[3]}`;

            return score_board;
        },
        hotStreakRelated(artist, score_board) {
            submit.style.display = "unset";
            document.getElementById("hot-streak-q").innerHTML = `Which of these names does Spotify designate as this artist's "related" artists?`;
            var mc_spots = Math.floor(Math.random() * 4);

            document.getElementById("checkbox1").parentNode.style.display = 'unset';
            document.getElementById("checkbox2").parentNode.style.display = 'unset';
            document.getElementById("checkbox3").parentNode.style.display = 'unset';
            document.getElementById("checkbox4").parentNode.style.display = 'unset';

            const related = [artist.artists[0].name, artist.artists[1].name, artist.artists[2].name, artist.artists[3].name,
            artist.artists[4].name, artist.artists[5].name, artist.artists[6].name, artist.artists[7].name, artist.artists[8].name,
            artist.artists[9].name, artist.artists[10].name, artist.artists[11].name, artist.artists[12].name, artist.artists[13].name,
            artist.artists[14].name, artist.artists[15].name, artist.artists[16].name, artist.artists[17].name, artist.artists[18].name,
            artist.artists[19].name];

            const random_artists = ["Drake", "Cardi B", "Lil Baby", "Michael Jackson", "NAV", "88GLAM", "Lil Yachty", "Joji", "Yeat",
                "Don Toliver", "Lil Uzi Vert", "Megan Thee Stallion", "Baby Keem", "Kendrick Lamar", "Lil Skies", "Rich Brian",
                "Lil Peep", "Guns N' Roses", "The Beatles", "Bee Gees", "Nirvana", "Foo Fighters", "Post Malone"];

            var difference = random_artists.filter(x => related.indexOf(x) === -1);

            var random_nums = [];
            var n = related.length;
            do {
                const randomNumber = Math.floor(Math.random() * related.length);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            if (mc_spots == 0) {
                var artist1 = difference[random_nums[1]];
                var artist2 = difference[random_nums[0]];
                var artist3 = related[random_nums[3]];
                var artist4 = difference[random_nums[2]];
            }
            else if (mc_spots == 1) {
                var artist1 = related[random_nums[2]];
                var artist2 = difference[random_nums[0]];
                var artist3 = related[random_nums[3]];
                var artist4 = difference[random_nums[1]];
            }
            else if (mc_spots == 2) {
                var artist1 = related[random_nums[2]];
                var artist2 = difference[random_nums[0]];
                var artist3 = related[random_nums[3]];
                var artist4 = related[random_nums[1]];
            }
            else {
                var artist1 = related[random_nums[2]];
                var artist2 = related[random_nums[0]];
                var artist3 = related[random_nums[3]];
                var artist4 = related[random_nums[1]];
            }


            var mc = ["A: " + artist1, "B: " + artist2, "C: " + artist3, "D: " + artist4];

            document.getElementById('label1').innerHTML = `${mc[0]}`;
            document.getElementById('label2').innerHTML = `${mc[1]}`;
            document.getElementById('label3').innerHTML = `${mc[2]}`;
            document.getElementById('label4').innerHTML = `${mc[3]}`;

            submit = document.getElementById('submit');
            submit.addEventListener('click', event => {
                if (mc_spots == 0) {
                    if (document.getElementById("checkbox1").checked == false && document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox2").checked == false && document.getElementById("checkbox4").checked == false) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }
                else if (mc_spots == 1) {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked == false
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked == false) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }
                else if (mc_spots == 2) {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked == false
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }
                else {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked) {
                        score_board[0]++;

                    }
                    else {
                        score_board[1]++;

                    }
                }

                submit.style.display = "none";
                document.getElementById("checkbox1").parentNode.style.display = 'none';
                document.getElementById("checkbox2").parentNode.style.display = 'none';
                document.getElementById("checkbox3").parentNode.style.display = 'none';
                document.getElementById("checkbox4").parentNode.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            });
            return score_board;

        },/*
        hotStreakTrackRelease(artistTopTen, score_board) {
            document.getElementById("hot-streak-q").innerHTML = `What is the release date of this song?`;
            var mc_spots = Math.floor(Math.random() * 4);

            var ABtn = document.getElementById("Abtn");
            var BBtn = document.getElementById("Bbtn");
            var CBtn = document.getElementById("Cbtn");
            var DBtn = document.getElementById("Dbtn");
            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick);
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick); 

            function AClick(event) {
                if (mc_spots == 0) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function BClick(event) {
                if (mc_spots == 1) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function CClick(event) {
                if (mc_spots == 2) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }
            function DClick(event) {
                if (mc_spots == 3) {
                    score_board[0]++;
                }
                else {
                    score_board[1]++;
                }
                ABtn.removeEventListener("click", AClick);
                BBtn.removeEventListener("click", BClick);
                CBtn.removeEventListener("click", CClick);
                DBtn.removeEventListener("click", DClick);
                ABtn.style.display = 'none';
                BBtn.style.display = 'none';
                CBtn.style.display = 'none';
                DBtn.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }

            var top_tracks = [artistTopTen.tracks[0], artistTopTen.tracks[1], artistTopTen.tracks[2], artistTopTen.tracks[3],
            artistTopTen.tracks[4], artistTopTen.tracks[5], artistTopTen.tracks[6], artistTopTen.tracks[7], artistTopTen.tracks[8],
            artistTopTen.tracks[9]];

            var random_nums = [];
            var n = 4;
            do {
                const randomNumber = Math.floor(Math.random() * 10);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            real_track = top_tracks[random_nums[0]].release_date;
            fake_track1 = top_tracks[random_nums[1]].release_date;
            fake_track2 = top_tracks[random_nums[2]].release_date;
            fake_track3 = top_tracks[random_nums[3]].release_date;

            const answers = [real_track, fake_track1, fake_track2, fake_track3];

            if (mc_spots == 0) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots + 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 3]];
            }
            else if (mc_spots == 1) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots + 2], "D: " + answers[mc_spots + 1]];
            }
            else if (mc_spots == 2) {
                var mc = ["A: " + answers[mc_spots], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots - 2], "D: " + answers[mc_spots + 1]];
            }
            else {
                var mc = ["A: " + answers[mc_spots - 2], "B: " + answers[mc_spots - 1], "C: " + answers[mc_spots], "D: " + answers[mc_spots - 3]];
            }


            document.getElementById("q1").innerHTML = `${mc[0]}`;
            document.getElementById("q2").innerHTML = `${mc[1]}`;
            document.getElementById("q3").innerHTML = `${mc[2]}`;
            document.getElementById("q4").innerHTML = `${mc[3]}`;

            return score_board;
        },*/
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function (UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();

    var score_board = [0, 0];
    var artistSelected = false;
    var gameModeSelected = false;

    document.getElementById("prompt").innerHTML = `Choose your quiz game mode`;

    // get artists on page load
    const loadArtist = async () => {

        document.getElementsByClassName("dropdown")[0].classList.add("active");

        hotStreakQ = document.getElementById('hot-streak-q');
        hotStreakQ.style.display = "none";

        finalScore = document.getElementById('final-score');
        finalScore.style.display = "none";

        q1 = document.getElementById('q1');
        q2 = document.getElementById('q2');
        q3 = document.getElementById('q3');
        q4 = document.getElementById('q4');
        q1.style.display = "none";
        q2.style.display = "none";
        q3.style.display = "none";
        q4.style.display = "none";

        document.getElementById("checkbox1").parentNode.style.display = 'none';
        document.getElementById("checkbox2").parentNode.style.display = 'none';
        document.getElementById("checkbox3").parentNode.style.display = 'none';
        document.getElementById("checkbox4").parentNode.style.display = 'none';

        document.getElementById("Abtn").style.display = 'none';
        document.getElementById("Bbtn").style.display = 'none';
        document.getElementById("Cbtn").style.display = 'none';
        document.getElementById("Dbtn").style.display = 'none';

        //get the token
        const token = await APICtrl.getToken();
        //store the token onto the page
        UICtrl.storeToken(token);
        const artists = await APICtrl.getArtists(token);
        //load artist select list
        UICtrl.createDropdown();
        artists.forEach(element => { UICtrl.createArtist(element.name, element.id) });

    }

    function hotStreakPopup(score_board) {
        document.getElementsByClassName("popup")[0].classList.add("active");

        document.getElementById("score").innerHTML = `Hot Streak of ${score_board[0]}!`;
        dismiss_btn = document.getElementById("dismiss-popup-btn");
        dismiss_btn.addEventListener("click", dismissPopup);

        if (score_board[1] != 0) {
            document.getElementById("score").innerHTML = `Final Score: Hot Streak of ${score_board[0]}!`;
            document.getElementById("dismiss-popup-btn").innerHTML = `Dismiss`;
            if (score_board[0] < 5) {
                document.getElementById("popup-title").innerHTML = `🧊Game Over!🧊 Cold round...`;
            }
            else {
                document.getElementById("popup-title").innerHTML = `🔥Game Over!🔥 You were on fire!`;
            }

        }

        function dismissPopup() {
            if (score_board[1] == 0) {
                dismiss_btn.removeEventListener("click", dismissPopup);
                document.getElementsByClassName("popup")[0].classList.remove("active");
                hotStreakQuestion();
            }
            else {
                document.getElementsByClassName("popup")[0].classList.remove("active");
            }

        }

    }


    var artist;
    var artistTopTracks;
    var relatedArtists;
    var artistTopTen;
    DOMInputs.artist.addEventListener('change', async () => {

        //store token to reduce calls on API for token
        const token = UICtrl.getStoredToken().token;
        //get the artist select field
        const artistSelect = UICtrl.inputField().artist;
        //get artist id
        const artistId = artistSelect.value;
        artistSelected = true;
        //get artist stats based on artist selected
        artist = await APICtrl.getArtist(token, artistId);
        artistTopTracks = await APICtrl.getArtistTopTracks(token, artistId);
        relatedArtists = await APICtrl.getRelatedArtists(token, artistId);

        var top_tracks = [artistTopTracks.tracks[0].id, artistTopTracks.tracks[1].id, artistTopTracks.tracks[2].id, 
        artistTopTracks.tracks[3].id, artistTopTracks.tracks[4].id, artistTopTracks.tracks[5].id,
        artistTopTracks.tracks[6].id, artistTopTracks.tracks[7].id, artistTopTracks.tracks[8].id, artistTopTracks.tracks[9].id];

        var tracksId = `${top_tracks[0]}`;
        for (var i = 1; i < 10; i++) {
            tracksId = "%" + top_tracks[i];
        }

        // artistTopTen = await APICtrl.getTracks(token, tracksId);
        /* CORS errors time!!!*/

        // load the artist details
        UICtrl.createArtistImage(artist.images[1].url, artist.name);

        document.getElementsByClassName("dropdown")[0].classList.remove("active");
        document.getElementsByClassName("chooseGame")[0].classList.add("active");

        choose = document.getElementById('chooseArtist');
        choose.style.display = "none";

    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function checkAnswer() {
        if (score_board[1] == 0) {
            console.log("Correct")
            hotStreakPopup(score_board);
        }
        else {
            console.log("lost");
            hotStreakPopup(score_board);
        }
    }

    async function hotStreakQuestion() {
        var sel_question = Math.floor(Math.random() * 5);
        // sel_question = 5;
        document.getElementsByClassName("qbox")[0].classList.add("active");
        submit = document.getElementById("submit");
        if (sel_question == 0 || sel_question == 1 || sel_question == 3 || sel_question == 5) {
            q1.style.display = "unset";
            q2.style.display = "unset";
            q3.style.display = "unset";
            q4.style.display = "unset";
            submit.style.display = "none";
        }
        else {
            q1.style.display = "none";
            q2.style.display = "none";
            q3.style.display = "none";
            q4.style.display = "none";
            submit.style.display = "unset";
        }
        if (sel_question == 0) {
            UICtrl.hotStreakRanking(artist, score_board);
        }
        else if (sel_question == 1) {
            UICtrl.hotStreakFollowers(artist, score_board);
        }
        else if (sel_question == 2) {
            UICtrl.hotStreakGenres(artist, score_board);
        }
        else if (sel_question == 3) {
            UICtrl.hotStreakTopTracks(artistTopTracks, score_board)
        }
        else if (sel_question == 4) {
            UICtrl.hotStreakRelated(relatedArtists, score_board);
        }
        else if (sel_question == 5) {
            UICtrl.hotStreakTrackRelease(artistTopTen, score_board);
        }

        var answered = false;
        for (let i = 0; i < 12; i++) {
            var qbox_active = document.getElementsByClassName('qbox active').length > 0;
            if (qbox_active) {
                console.log(`Waiting ${i/4} seconds...`);
                await sleep(i * 250);
            }
            else {
                answered = true;
                checkAnswer();
                break;
            }
            
        }
        if (answered == false) {
            score_board[1]++;
            checkAnswer();
        }
        

    }

    hsbtn = document.getElementById('hsbtn');
    hsbtn.addEventListener('click', event => {
        if (artistSelected && gameModeSelected == false) {
            gameModeSelected = true;
            prompt = document.getElementById('prompt');
            prompt.style.display = "none";

            hotStreakQ.style.display = "unset";
            document.getElementsByClassName("chooseGame")[0].classList.remove("active");

            hotStreakQuestion();
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



