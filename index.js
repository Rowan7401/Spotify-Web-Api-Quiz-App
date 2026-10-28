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

const APIController = (function () {
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


const UIController = (function () {

    //object to hold references to html selectors
    const DOMElements = {
        hfToken: '#hidden_token',
        selectArtist: '#select_artist',
        divRanking: '#artist-ranking',
        divAlbumDetail: '#album-detail',
        divArtistDetail: '#artist-detail'
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                artist: document.querySelector(DOMElements.selectArtist),
                ranking: document.querySelector(DOMElements.divRanking),
                AlbumDetail: document.querySelector(DOMElements.divAlbumDetail),
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
        createArtistImage(img, name) {

            var html = `

            <span class="artistHeader">${name}:</span>
            `;
            if (img) {
                html += `<div class="form-label col-sm-12 px-0"><img src="${img}" alt="artist_pic"></div>`;
            }
            document.querySelector(DOMElements.divArtistDetail).insertAdjacentHTML("beforeend", html)
        },
        createAlbumImage(img, name) {

            var html = `

            <span class="artistHeader">${name}:</span>
            `;
            if (img) {
                html += `<div class="form-label col-sm-12 px-0"><img src="${img}" alt="album_pic"></div>`;
            }
            document.querySelector(DOMElements.divAlbumDetail).insertAdjacentHTML("beforeend", html)
        },
        showStatus(message, isError = false) {
            const status = document.getElementById('api-status');
            status.textContent = message;
            status.classList.toggle('error', isError);
        },
        getImageUrl(images) {
            if (!Array.isArray(images) || images.length === 0) {
                return null;
            }
            const image = images.find(item => item && typeof item.url === 'string' && item.url);
            return image ? image.url : null;
        },
        showMissingData(dataName) {
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");
            document.getElementById("hot-streak-q").textContent =
                `Sorry, Spotify does not have enough ${dataName} data for this artist to create this question. Skipping it.`;

            for (let i = 1; i <= 4; i++) {
                document.getElementById(`q${i}`).textContent = '';
                const checkbox = document.getElementById(`checkbox${i}`);
                checkbox.checked = false;
                checkbox.parentNode.style.display = 'none';
            }
            document.getElementById('submit').style.display = 'none';
            [ABtn, BBtn, CBtn, DBtn].forEach(button => {
                if (button) {
                    button.style.display = 'none';
                }
            });
            return false;
        },
        removeAlbumImage() {
            this.inputField().AlbumDetail.innerHTML = '';
        },
        popularity(artist, mc_spots) {
            if (!Number.isFinite(artist?.popularity)) {
                return this.showMissingData('artist popularity');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            document.getElementById("hot-streak-q").innerHTML = `What does Spotify rate ${artist.name}'s popularity? (100 = most popular)`;

            var real_ranking = artist.popularity;

            var random_nums = [];
            var n = 3;
            do {
                const randomNumber = Math.floor(Math.random() * 101);
                if (!random_nums.includes(randomNumber) && randomNumber != real_ranking) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            var fake_rank1 = random_nums[0];
            var fake_rank2 = random_nums[1];
            var fake_rank3 = random_nums[2];

            var answers = [real_ranking, fake_rank1, fake_rank2, fake_rank3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        followers(artist, mc_spots) {
            if (!Number.isFinite(artist?.followers?.total)) {
                return this.showMissingData('artist follower');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            document.getElementById("hot-streak-q").innerHTML = `How many followers on Spotify does ${artist.name} have?`;

            var random_nums = [];
            var n = 3;
            do {
                const randomNumber = Math.floor(Math.random() * 10000000);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            var real_followers = artist.followers.total
            var fake_followers1 = random_nums[0];
            var fake_followers2 = random_nums[1];
            var fake_followers3 = random_nums[2];

            real_followers = real_followers.toLocaleString('en-US')
            fake_followers1 = fake_followers1.toLocaleString('en-US')
            fake_followers2 = fake_followers2.toLocaleString('en-US')
            fake_followers3 = fake_followers3.toLocaleString('en-US')

            var answers = [real_followers, fake_followers1, fake_followers2, fake_followers3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        genres(artist, score_board) {
            const artistGenres = Array.isArray(artist?.genres)
                ? artist.genres.filter(genre => typeof genre === 'string' && genre.trim())
                : [];
            if (artistGenres.length === 0) {
                return this.showMissingData('artist genre');
            }
            const submitButton = document.getElementById("submit");
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            document.getElementById("hot-streak-q").innerHTML = `What genre(s) does Spotify not label ${artist.name} with?`;

            document.getElementById("checkbox1").parentNode.style.display = 'unset';
            document.getElementById("checkbox2").parentNode.style.display = 'unset';
            document.getElementById("checkbox3").parentNode.style.display = 'unset';
            document.getElementById("checkbox4").parentNode.style.display = 'unset';

            if (artistGenres.length == 1) {
                var real_genres = [artistGenres[0]];
            }
            else if (artistGenres.length == 2) {
                var real_genres = [artistGenres[0], artistGenres[1]];
            }
            else {
                var real_genres = [artistGenres[0], artistGenres[1], artistGenres[2]];
            }

            const random_genres = ["canadian hip hop", "canadian trap", "hip hop", "melodic rap", "rap", "toronto rap", "trap",
                "vapor trap", "pop", "alternative rock", "grunge", "permanent wave", "rock", "alternative r&b", "viral pop", "indonesian r&b",
                "indonesian hip hop", "pluggnb", "r&b", "hyperpop", "glitchcore", "glitch rap", "reggaeton"];

            var difference = random_genres.filter(x => real_genres.indexOf(x) === -1);

            var genre1 = real_genres[0];
            var genre4 = difference[Math.floor(Math.random() * difference.length)]
            if (real_genres.length == 1) {
                var genre2 = difference[Math.floor(Math.random() * difference.length)];
                var genre3 = difference[Math.floor(Math.random() * difference.length)];
            }
            else if (real_genres.length == 2) {
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

            submitButton.addEventListener("click", submitAnswer);
            function submitAnswer(event) {
                console.log("submit clicked")
                if (real_genres.length == 1) {
                    if (document.getElementById("checkbox2").checked
                        && document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox4").checked
                        && document.getElementById("checkbox1").checked == false) {
                        score_board[0]++;
        
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[1]}, ${mc[2]}, ${mc[3]}`;
                }
                else if (real_genres.length == 2) {
                    if (document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox4").checked
                        && document.getElementById("checkbox1").checked == false
                        && document.getElementById("checkbox2").checked == false) {
                        score_board[0]++;
                        
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[2]}, ${mc[3]}`;
                }
                else {
                    if (document.getElementById("checkbox4").checked && document.getElementById("checkbox1").checked == false
                        && document.getElementById("checkbox2").checked == false && document.getElementById("checkbox3").checked == false) {
                        score_board[0]++;
                      
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[3]}`;
                }
                submitButton.removeEventListener("click", submitAnswer);
                document.getElementById("checkbox1").parentNode.style.display = 'none';
                document.getElementById("checkbox2").parentNode.style.display = 'none';
                document.getElementById("checkbox3").parentNode.style.display = 'none';
                document.getElementById("checkbox4").parentNode.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
              
            }
           
        },
        topTracks(artist, artistTopTracks, mc_spots) {
            if (!Array.isArray(artistTopTracks?.tracks) || artistTopTracks.tracks.length < 10
                || artistTopTracks.tracks.slice(0, 10).some(track => !track?.name)) {
                return this.showMissingData('top track');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            document.getElementById("hot-streak-q").innerHTML = `What are ${artist.name}'s hottest 3 tracks currently?`;

            var top_tracks = [artistTopTracks.tracks[0].name, artistTopTracks.tracks[1].name, artistTopTracks.tracks[2].name,
            artistTopTracks.tracks[3].name, artistTopTracks.tracks[4].name, artistTopTracks.tracks[5].name, artistTopTracks.tracks[6].name,
            artistTopTracks.tracks[7].name, artistTopTracks.tracks[8].name, artistTopTracks.tracks[9].name];

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


            var answers = [top_three, fake_three1, fake_three2, fake_three3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        related(artist, relatedArtists, score_board, mc_spots) {
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            document.getElementById("hot-streak-q").innerHTML = `Which of these names does Spotify designate as ${artist.name}'s
             "related" artists?`;

            document.getElementById("checkbox1").parentNode.style.display = 'unset';
            document.getElementById("checkbox2").parentNode.style.display = 'unset';
            document.getElementById("checkbox3").parentNode.style.display = 'unset';
            document.getElementById("checkbox4").parentNode.style.display = 'unset';

            const related = [relatedArtists.artists[0].name, relatedArtists.artists[1].name, relatedArtists.artists[2].name,
            relatedArtists.artists[3].name, relatedArtists.artists[4].name, relatedArtists.artists[5].name, relatedArtists.artists[6].name,
            relatedArtists.artists[7].name, relatedArtists.artists[8].name, relatedArtists.artists[9].name, relatedArtists.artists[10].name,
            relatedArtists.artists[11].name, relatedArtists.artists[12].name, relatedArtists.artists[13].name, relatedArtists.artists[14].name,
            relatedArtists.artists[15].name, relatedArtists.artists[16].name, relatedArtists.artists[17].name, relatedArtists.artists[18].name,
            relatedArtists.artists[19].name];

            const random_artists = ["Drake", "Cardi B", "Lil Baby", "Michael Jackson", "NAV", "88GLAM", "Lil Yachty", "Joji", "Yeat",
                "Don Toliver", "Lil Uzi Vert", "Megan Thee Stallion", "Baby Keem", "Kendrick Lamar", "Lil Skies", "Rich Brian",
                "Lil Peep", "Guns N' Roses", "The Beatles", "Bee Gees", "Nirvana", "Foo Fighters", "Post Malone", "Doja Cat",
                "Megan Thee Stallion", "Migos", "Offset", "Red Hot Chili Peppers"];

            var difference = random_artists.filter(x => related.indexOf(x) === -1);

            var nameIndex = difference.indexOf(artist.name);
            if (nameIndex > -1) {
                difference.splice(nameIndex, 1);
            }

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

            submit.addEventListener("click", submitAnswer);
            function submitAnswer(event) {
                if (mc_spots == 0) {
                    if (document.getElementById("checkbox1").checked == false && document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox2").checked == false && document.getElementById("checkbox4").checked == false) {
                        score_board[0]++;
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[2]}`;
                }
                else if (mc_spots == 1) {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked == false
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked == false) {
                        score_board[0]++;
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[0]}, ${mc[2]}`;
                }
                else if (mc_spots == 2) {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked == false
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked) {
                        score_board[0]++;
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[0]}, ${mc[2]}, ${mc[3]}`;
                }
                else {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked) {
                        score_board[0]++;
                        document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                        document.getElementById("fire").innerHTML = `✅`

                    }
                    else {
                        score_board[1]++;
                        document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                        document.getElementById("fire").innerHTML = `❌`

                    }
                    document.getElementById("score").innerHTML += `Answer: ${mc[1]}, ${mc[2]}, ${mc[3]}, ${mc[0]}`;
                }
                submit.removeEventListener("click", submitAnswer);
                document.getElementById("checkbox1").parentNode.style.display = 'none';
                document.getElementById("checkbox2").parentNode.style.display = 'none';
                document.getElementById("checkbox3").parentNode.style.display = 'none';
                document.getElementById("checkbox4").parentNode.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }

            return score_board;

        },
        trackRelease(artistTopTen, mc_spots) {
            const tracksWithReleaseDates = Array.isArray(artistTopTen?.tracks)
                ? artistTopTen.tracks.filter(track => track?.name && /^\d{4}-\d{2}-\d{2}$/.test(track.album?.release_date))
                : [];
            if (tracksWithReleaseDates.length < 4) {
                return this.showMissingData('track release date');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            var top_tracks = tracksWithReleaseDates;

            var random_nums = [];
            var n = 4;
            do {
                const randomNumber = Math.floor(Math.random() * top_tracks.length);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);


            real_track = top_tracks[random_nums[0]].album.release_date;
            fake_track1 = top_tracks[random_nums[1]].album.release_date;
            fake_track2 = top_tracks[random_nums[2]].album.release_date;
            fake_track3 = top_tracks[random_nums[3]].album.release_date;

            function dateShift(date) {
                var newDate;
                var newMonth = Math.floor(Math.random() * 12) + 1;
                var newDay = Math.floor(Math.random() * 27) + 1;
                if (newMonth < 10) {
                    newMonth = "0" + newMonth;
                }
                if (newDay < 10) {
                    newDay = "0" + newDay;
                }

                newDate = newMonth + "/" + newDay + "/" + date.substring(0, 4);
                return newDate;
            }

            real_track = real_track.substring(5, 7) + "/" + real_track.substring(8, 10) + "/" + real_track.substring(0, 4);
            fake_track1 = dateShift(fake_track1);
            fake_track2 = dateShift(fake_track2);
            fake_track3 = dateShift(fake_track3);

            var song_name = top_tracks[random_nums[0]].name;

            document.getElementById("hot-streak-q").innerHTML = `What is the release date of "${song_name}"?`;

            var answers = [real_track, fake_track1, fake_track2, fake_track3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;
        },
        trackLength(artistTopTen, mc_spots) {
            const tracksWithDuration = Array.isArray(artistTopTen?.tracks)
                ? artistTopTen.tracks.filter(track => track?.name && Number.isFinite(track.duration_ms))
                : [];
            if (tracksWithDuration.length < 4) {
                return this.showMissingData('track duration');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            var top_tracks = tracksWithDuration;

            var random_nums = [];
            var n = 4;
            do {
                const randomNumber = Math.floor(Math.random() * top_tracks.length);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);


            real_track = top_tracks[random_nums[0]].duration_ms;
            fake_track1 = top_tracks[random_nums[1]].duration_ms;
            fake_track2 = top_tracks[random_nums[2]].duration_ms;
            fake_track3 = top_tracks[random_nums[3]].duration_ms;

            function msToTime(s) {
                function pad(n, z) {
                    z = z || 2;
                    return ('00' + n).slice(-z);
                }

                var ms = s % 1000;
                s = (s - ms) / 1000;
                var secs = s % 60;
                s = (s - secs) / 60;
                var mins = s % 60;

                var duration = pad(mins) + ':' + pad(secs);
                return duration.substring(1);
            }

            real_track = msToTime(real_track);
            fake_track1 = msToTime(fake_track1);
            fake_track2 = msToTime(fake_track2);
            fake_track3 = msToTime(fake_track3);

            var song_name = top_tracks[random_nums[0]].name;

            document.getElementById("hot-streak-q").innerHTML = `How long is "${song_name}"?`;


            var answers = [real_track, fake_track1, fake_track2, fake_track3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        trackAnalysis(artistTopTen, artistTopTenAnalysis, mc_spots) {
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            var top_tracks = [artistTopTen.tracks[0], artistTopTen.tracks[1],
            artistTopTen.tracks[2], artistTopTen.tracks[3], artistTopTen.tracks[4],
            artistTopTen.tracks[5], artistTopTen.tracks[6], artistTopTen.tracks[7],
            artistTopTen.tracks[8], artistTopTen.tracks[9]];

            var top_tracks_analysis = [artistTopTenAnalysis.audio_features[0], artistTopTenAnalysis.audio_features[1],
            artistTopTenAnalysis.audio_features[2], artistTopTenAnalysis.audio_features[3], artistTopTenAnalysis.audio_features[4],
            artistTopTenAnalysis.audio_features[5], artistTopTenAnalysis.audio_features[6], artistTopTenAnalysis.audio_features[7],
            artistTopTenAnalysis.audio_features[8], artistTopTenAnalysis.audio_features[9]];

            var random_nums = [];
            var n = 4;
            do {
                const randomNumber = Math.floor(Math.random() * 10);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            var song_name = top_tracks[random_nums[0]].name;

            if (mc_spots == 0) {
                document.getElementById("hot-streak-q").innerHTML = `What does Spotify rate the danceability of "${song_name}"? (0-1 scale)`;
                real_track = top_tracks_analysis[random_nums[0]].danceability;
                fake_track1 = top_tracks_analysis[random_nums[1]].danceability;
                fake_track2 = top_tracks_analysis[random_nums[2]].danceability;
                fake_track3 = top_tracks_analysis[random_nums[3]].danceability;
            }
            else if (mc_spots == 1) {
                document.getElementById("hot-streak-q").innerHTML = `What does Spotify rate the acousticness of "${song_name}"? (0-1 scale)`;
                real_track = top_tracks_analysis[random_nums[0]].acousticness;
                fake_track1 = top_tracks_analysis[random_nums[1]].acousticness;
                fake_track2 = top_tracks_analysis[random_nums[2]].acousticness;
                fake_track3 = top_tracks_analysis[random_nums[3]].acousticness;
            }
            else if (mc_spots == 2) {
                document.getElementById("hot-streak-q").innerHTML = `What does Spotify rate the energy of "${song_name}"? (0-1 scale)`;
                real_track = top_tracks_analysis[random_nums[0]].energy;
                fake_track1 = top_tracks_analysis[random_nums[1]].energy;
                fake_track2 = top_tracks_analysis[random_nums[2]].energy;
                fake_track3 = top_tracks_analysis[random_nums[3]].energy;
            }
            else {
                document.getElementById("hot-streak-q").innerHTML = `What does Spotify rate the tempo of "${song_name}"? (bpm)`;
                real_track = top_tracks_analysis[random_nums[0]].tempo;
                fake_track1 = top_tracks_analysis[random_nums[1]].tempo;
                fake_track2 = top_tracks_analysis[random_nums[2]].tempo;
                fake_track3 = top_tracks_analysis[random_nums[3]].tempo;
            }

            var answers = [real_track, fake_track1, fake_track2, fake_track3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        trackPopularity(artistTopTen, mc_spots) {
            const tracksWithPopularity = Array.isArray(artistTopTen?.tracks)
                ? artistTopTen.tracks.filter(track => track?.name && Number.isFinite(track.popularity))
                : [];
            if (new Set(tracksWithPopularity.map(track => track.popularity)).size < 4) {
                return this.showMissingData('track popularity');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            var top_tracks = tracksWithPopularity;

            var rand = Math.floor(Math.random() * top_tracks.length);
            var real_track = top_tracks[rand].popularity;

            var fake_tracks = Array.from(new Set(top_tracks
                .filter(track => track.popularity !== real_track)
                .map(track => track.popularity)));
            fake_tracks.sort(() => Math.random() - 0.5);


            var fake_track1 = fake_tracks[0];
            var fake_track2 = fake_tracks[1];
            var fake_track3 = fake_tracks[2];


            var song_name = top_tracks[rand].name;

            document.getElementById("hot-streak-q").innerHTML = `What is the popularity of "${song_name}"? (100 = most popular)`;

            var answers = [real_track, fake_track1, fake_track2, fake_track3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;


        },
        albumCount(albums, artist, artistAlbums, mc_spots) {
            const albumTotal = Number.isFinite(artistAlbums?.total)
                ? artistAlbums.total
                : (albums.length > 0 ? albums.length : null);
            if (!Number.isFinite(albumTotal) || albumTotal < 0) {
                return this.showMissingData('album count');
            }
            document.getElementsByClassName("artist-detail")[0].classList.add("active");
            document.getElementsByClassName("album-detail")[0].classList.remove("active");

            var real_albums = albumTotal;

            var random_nums = [];
            var n = 3;
            do {
                const randomNumber = Math.floor(Math.random() * 11);

                if (!random_nums.includes(randomNumber) && randomNumber != real_albums) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);


            var fake_albums1 = random_nums[0];
            var fake_albums2 = random_nums[1];
            var fake_albums3 = random_nums[2];


            var artist_name = artist.name;

            document.getElementById("hot-streak-q").innerHTML = `How many official albums does ${artist_name} have under their name? 
            (not updated recently..)`;

            var answers = [real_albums, fake_albums1, fake_albums2, fake_albums3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        albumTrackCount(albums, mc_spots, randomAlbumIndex) {
            const album = albums?.[randomAlbumIndex];
            if (!Number.isFinite(album?.total_tracks) || album.total_tracks < 0) {
                return this.showMissingData('album track count');
            }
            document.getElementsByClassName("artist-detail")[0].classList.remove("active");
            document.getElementsByClassName("album-detail")[0].classList.add("active");

            real_track_count = album.total_tracks;

            var rands = [];
            var x = 3;
            do {
                const randomNumber = Math.floor(Math.random() * 15) + 5;

                if (!rands.includes(randomNumber) && randomNumber != real_track_count) {
                    rands.push(randomNumber);
                }

            } while (rands.length < x);

            var fake_track_count1 = rands[0];
            var fake_track_count2 = rands[1];
            var fake_track_count3 = rands[2];

            document.getElementById("hot-streak-q").innerHTML = `How many tracks does "${album.name || 'this album'}" have?`;


            var answers = [real_track_count, fake_track_count1, fake_track_count2, fake_track_count3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
        albumRelease(albums, mc_spots, randomAlbumIndex) {
            const albumsWithReleaseDates = Array.isArray(albums)
                ? albums.filter(album => /^\d{4}-\d{2}-\d{2}$/.test(album?.release_date))
                : [];
            if (albumsWithReleaseDates.length < 4) {
                return this.showMissingData('album release date');
            }
            document.getElementsByClassName("artist-detail")[0].classList.remove("active");
            document.getElementsByClassName("album-detail")[0].classList.add("active");

            const releaseDateAlbum = albumsWithReleaseDates.find(album => album === albums[randomAlbumIndex])
                || albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)];
            real_album_rel = releaseDateAlbum.release_date;
            fake_album_rel1 = albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)].release_date;
            fake_album_rel2 = albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)].release_date;
            fake_album_rel3 = albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)].release_date;

            function dateShift(date) {
                var newDate;
                var newMonth = Math.floor(Math.random() * 12) + 1;
                var newDay = Math.floor(Math.random() * 27) + 1;
                if (newMonth < 10) {
                    newMonth = "0" + newMonth;
                }
                if (newDay < 10) {
                    newDay = "0" + newDay;
                }

                newDate = newMonth + "/" + newDay + "/" + date.substring(0, 4);
                return newDate;
            }

            real_album_rel = real_album_rel.substring(5, 7) + "/" + real_album_rel.substring(8, 10) + "/" + real_album_rel.substring(0, 4);
            fake_album_rel1 = dateShift(fake_album_rel1);
            fake_album_rel2 = dateShift(fake_album_rel2);
            fake_album_rel3 = dateShift(fake_album_rel3);


            document.getElementById("hot-streak-q").innerHTML = `When was "${releaseDateAlbum.name || 'this album'}" released?`;

            answers = [real_album_rel, fake_album_rel1, fake_album_rel2, fake_album_rel3];

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


            q1.innerHTML = `${mc[0]}`;
            q2.innerHTML = `${mc[1]}`;
            q3.innerHTML = `${mc[2]}`;
            q4.innerHTML = `${mc[3]}`;

            document.getElementById("score").innerHTML += `Answer: ${answers[0]}`;

        },
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
    var extraQuestions = true;
    var questionSkipped = false;
    var fullTestQuestionIndex = 0;


    var i = 0;
    var random_nums = [];
    var n = 11;
    do {
        const randomNumber = Math.floor(Math.random() * 11);
        if (!random_nums.includes(randomNumber)) {
            random_nums.push(randomNumber);
        }

    } while (random_nums.length < n);

    document.getElementById("prompt").innerHTML = `Choose your quiz game mode`;

    // get artists on page load
    const loadArtist = async () => {

        document.getElementsByClassName("dropdown")[0].classList.add("active");
        document.getElementsByClassName("reset-page")[0].classList.remove("active");

        q1 = document.getElementById('q1');
        q2 = document.getElementById('q2');
        q3 = document.getElementById('q3');
        q4 = document.getElementById('q4');
        q1.style.display = "none";
        q2.style.display = "none";
        q3.style.display = "none";
        q4.style.display = "none";

        genres = document.getElementById('genres');
        top_tracks = document.getElementById('top-tracks');
        track_release = document.getElementById('track-release');
        track_length = document.getElementById('track-length');
        album_count = document.getElementById('album-count');
        album_tracks = document.getElementById('album-tracks');
        album_release = document.getElementById('album-release');

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

        ABtn = document.getElementById("Abtn");
        BBtn = document.getElementById("Bbtn");
        CBtn = document.getElementById("Cbtn");
        DBtn = document.getElementById("Dbtn");

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

    reset_btn = document.getElementById("reset-btn");
    reset_btn.addEventListener("click", resetPage);

    function resetPage() {
        location.reload();
    }

    function playAgainHotStreak() {
        score_board = [0, 0];

        document.getElementsByClassName("reset-page")[0].classList.remove("active");
        document.getElementsByClassName("question")[0].classList.add("active");
        UICtrl.removeAlbumImage();
        document.getElementById("score").innerHTML = ``;

        console.log(score_board)
        hotStreakQuestion();
    }
    function playAgainTest() {
        score_board = [0, 0];
        fullTestQuestionIndex = 0;
        i = 0;
        extraQuestions = true;

        document.getElementsByClassName("reset-page")[0].classList.remove("active");
        document.getElementsByClassName("question")[0].classList.add("active");
        document.getElementById("score").innerHTML = ``;
        UICtrl.removeAlbumImage();

        console.log(score_board)
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
    DOMInputs.artist.addEventListener('change', async () => {
        artistSelected = false;
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

            choose = document.getElementById('prompt-title');
            choose.style.transform = "translate(-100%, -100%)";
            choose.style.visibility = "hidden";
            artistSelected = true;
            UICtrl.showStatus('');
        } catch (error) {
            UICtrl.showStatus(`Unable to load this artist. ${error.message}`, true);
        }
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function checkHotStreakAnswer() {
        if (score_board[1] == 0) {
            console.log("Correct")
            hotStreakPopup(score_board);
        }
        else {
            console.log("lost");
            hotStreakPopup(score_board);
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

        genres.addEventListener("click", GenresClick);
        top_tracks.addEventListener("click", TopTracksClick);
        track_release.addEventListener("click", TrackReleaseClick);
        track_length.addEventListener("click", TrackLengthClick);
        album_count.addEventListener("click", AlbumCountClick);
        album_tracks.addEventListener("click", AlbumTracksClick);
        album_release.addEventListener("click", AlbumReleaseClick);


        function AClick(event) {
            if (mc_spots == 0) {
                score_board[0]++;
                correct = true;
            }
            else {
                score_board[1]++;
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
                score_board[0]++;
                correct = true;
            }
            else {
                score_board[1]++;
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
                score_board[0]++;
                correct = true;
            }
            else {
                score_board[1]++;
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
                score_board[0]++;
                correct = true;
            }
            else {
                score_board[1]++;
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkChooseQAnswer(correct);
        }

        function skipUnavailableQuestion() {
            questionSkipped = true;
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
            qType = true;
            console.log("genres clicked")

            document.getElementsByClassName("question")[0].classList.add("active");
            document.getElementsByClassName("chooseQ-game")[0].classList.remove("active");
            document.getElementsByClassName("qbox")[0].classList.add("active");

            var old_correct = score_board[0]; 

            if (UICtrl.genres(artist, score_board) === false) {
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
            var new_correct = score_board[0];
            if (new_correct > old_correct) {
                correct = true;
            }
            checkChooseQAnswer(correct);
                        
        }
        function TopTracksClick(event) {
            console.log("top tracks clicked")
            if (UICtrl.topTracks(artist, artistTopTracks, mc_spots) === false) {
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
            if (UICtrl.trackRelease(artistTopTen, mc_spots) === false) {
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
            if (UICtrl.trackLength(artistTopTen, mc_spots) === false) {
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
            if (UICtrl.albumCount(albums, artist, artistAlbums, mc_spots) === false) {
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
            if (UICtrl.albumTrackCount(albums, mc_spots, randomAlbumIndex) === false) {
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
            if (UICtrl.albumRelease(albums, mc_spots, randomAlbumIndex) === false) {
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

        console.log("beforoe timeout")
        console.log(qType)

    }

    function setQuestionBoxType(qType, AClick, BClick, CClick, DClick) {
        submit = document.getElementById("submit");
        if (qType) {

            q1.style.display = "none";
            q2.style.display = "none";
            q3.style.display = "none";
            q4.style.display = "none";

            submit.style.display = "unset";

            ABtn.style.display = 'none';
            BBtn.style.display = 'none';
            CBtn.style.display = 'none';
            DBtn.style.display = 'none';
        }
        else {
            q1.style.display = "unset";
            q2.style.display = "unset";
            q3.style.display = "unset";
            q4.style.display = "unset";

            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick)
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick);

            submit.style.display = "none";
            document.getElementById("fire").innerHTML = `🔥`
        }

    }

    function checkChooseQAnswer(correct) {
        if (questionSkipped) {
            document.getElementById("popup-title").innerHTML = `Question skipped`;
            document.getElementById("fire").innerHTML = `ℹ️`;
            chooseQAnswerPopUp(score_board);
        }
        else if (correct) {
            console.log("Correct")
            document.getElementById("popup-title").innerHTML = `Correct!!`;
            document.getElementById("fire").innerHTML = `✅`
            chooseQAnswerPopUp(score_board);
        }
        else {
            console.log("Incorrect");
            document.getElementById("popup-title").innerHTML = `Incorrect!!`;
            document.getElementById("fire").innerHTML = `❌`
            chooseQAnswerPopUp(score_board);
        }
    }

    async function hotStreakQuestion() {
        questionSkipped = false;
        let questionAvailable = true;
        var sel_question = Math.floor(Math.random() * 10);
        document.getElementsByClassName("qbox")[0].classList.add("active");
        var mc_spots = Math.floor(Math.random() * 4);

        if (albums.length != 0) {
            randomAlbumIndex = Math.floor(Math.random() * albums.length);
            UICtrl.createAlbumImage(UICtrl.getImageUrl(albums[randomAlbumIndex].images), albums[randomAlbumIndex].name);
        }

        if (sel_question == 0) {
            questionAvailable = UICtrl.popularity(artist, mc_spots) !== false;
        }
        else if (sel_question == 1) {
            questionAvailable = UICtrl.followers(artist, mc_spots) !== false;
        }
        else if (sel_question == 2) {
            questionAvailable = UICtrl.genres(artist, score_board) !== false;
        }
        else if (sel_question == 3) {
            questionAvailable = UICtrl.topTracks(artist, artistTopTracks, mc_spots) !== false;
        }
        else if (sel_question == 4) {
            questionAvailable = UICtrl.trackRelease(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 5) {
            questionAvailable = UICtrl.trackLength(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 6) {
            questionAvailable = UICtrl.trackPopularity(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 7) {
            questionAvailable = UICtrl.albumCount(albums, artist, artistAlbums, mc_spots) !== false;
        }
        else if (sel_question == 8) {
            questionAvailable = UICtrl.albumTrackCount(albums, mc_spots, randomAlbumIndex) !== false;
        }
        else if (sel_question == 9) {
            questionAvailable = UICtrl.albumRelease(albums, mc_spots, randomAlbumIndex) !== false;
        }

        if (!questionAvailable) {
            questionSkipped = true;
            document.getElementsByClassName("qbox")[0].classList.remove("active");
            checkHotStreakAnswer();
            return;
        }

        submit = document.getElementById("submit");
        if (sel_question == 2) {
            q1.style.display = "none";
            q2.style.display = "none";
            q3.style.display = "none";
            q4.style.display = "none";

            submit.style.display = "unset";

            ABtn.style.display = 'none';
            BBtn.style.display = 'none';
            CBtn.style.display = 'none';
            DBtn.style.display = 'none';
        }
        else {
            q1.style.display = "unset";
            q2.style.display = "unset";
            q3.style.display = "unset";
            q4.style.display = "unset";

            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick)
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick);

            submit.style.display = "none";
            document.getElementById("fire").innerHTML = `🔥`
        }


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
            score_board[1]++;
            checkHotStreakAnswer();
        }


    }

    function fullTest() {
        var sel_question = fullTestQuestionIndex++;
        fullTestQuestion(sel_question);
        if (sel_question == 13) {
            extraQuestions = false;
        }

    }

    async function fullTestQuestion(sel_question) {
        questionSkipped = false;
        let questionAvailable = true;
        document.getElementsByClassName("qbox")[0].classList.add("active");
        var mc_spots = Math.floor(Math.random() * 4);
        var correctAnswer = false;

        if (albums.length != 0) {
            randomAlbumIndex = Math.floor(Math.random() * albums.length);
            UICtrl.createAlbumImage(UICtrl.getImageUrl(albums[randomAlbumIndex].images), albums[randomAlbumIndex].name);
        }

        if (sel_question == 0) {
            questionAvailable = UICtrl.popularity(artist, mc_spots) !== false;
        }
        else if (sel_question == 1) {
            questionAvailable = UICtrl.followers(artist, mc_spots) !== false;
        }
        else if (sel_question == 2) {
            questionAvailable = UICtrl.genres(artist, score_board) !== false;
        }
        else if (sel_question == 3) {
            questionAvailable = UICtrl.topTracks(artist, artistTopTracks, mc_spots) !== false;
        }
        else if (sel_question == 4) {
            questionAvailable = UICtrl.trackRelease(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 5) {
            questionAvailable = UICtrl.trackLength(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 6) {
            questionAvailable = UICtrl.trackPopularity(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 7) {
            questionAvailable = UICtrl.albumCount(albums, artist, artistAlbums, mc_spots) !== false;
        }
        else if (sel_question == 8) {
            questionAvailable = UICtrl.albumTrackCount(albums, mc_spots, randomAlbumIndex) !== false;
        }
        else if (sel_question == 9) {
            questionAvailable = UICtrl.albumRelease(albums, mc_spots, randomAlbumIndex) !== false;
        }
        else if (sel_question == 10) {
            questionAvailable = UICtrl.trackPopularity(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 11) {
            questionAvailable = UICtrl.trackRelease(artistTopTen, mc_spots) !== false;
        }
        else if (sel_question == 12) {
            questionAvailable = UICtrl.albumTrackCount(albums, mc_spots, randomAlbumIndex) !== false;
        }
        else if (sel_question == 13) {
            questionAvailable = UICtrl.albumRelease(albums, mc_spots, randomAlbumIndex) !== false;
        }

        if (!questionAvailable) {
            questionSkipped = true;
            document.getElementsByClassName("qbox")[0].classList.remove("active");
            fullTestPopup();
            return;
        }

        var checkboxQ;
        submit = document.getElementById("submit");
        if (sel_question == 2) {
            q1.style.display = "none";
            q2.style.display = "none";
            q3.style.display = "none";
            q4.style.display = "none";

            submit.style.display = "unset";
            checkboxQ = true;

            ABtn.style.display = 'none';
            BBtn.style.display = 'none';
            CBtn.style.display = 'none';
            DBtn.style.display = 'none';
        }
        else {
            q1.style.display = "unset";
            q2.style.display = "unset";
            q3.style.display = "unset";
            q4.style.display = "unset";

            ABtn.style.display = 'unset';
            BBtn.style.display = 'unset';
            CBtn.style.display = 'unset';
            DBtn.style.display = 'unset';

            ABtn.addEventListener("click", AClick)
            BBtn.addEventListener("click", BClick);
            CBtn.addEventListener("click", CClick);
            DBtn.addEventListener("click", DClick);

            submit.style.display = "none";
            checkboxQ = false;
        }

        function AClick(event) {
            if (mc_spots == 0) {
                score_board[0]++;
                correctAnswer = true;
            }
            else {
                score_board[1]++;
                correctAnswer = false;
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }
        function BClick(event) {
            if (mc_spots == 1) {
                score_board[0]++;
                correctAnswer = true;
            }
            else {
                score_board[1]++;
                correctAnswer = false;
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }
        function CClick(event) {
            if (mc_spots == 2) {
                score_board[0]++;
                correctAnswer = true;
            }
            else {
                score_board[1]++;
                correctAnswer = false;
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }
        function DClick(event) {
            if (mc_spots == 3) {
                score_board[0]++;
                correctAnswer = true;
            }
            else {
                score_board[1]++;
                correctAnswer = false;
            }
            ABtn.removeEventListener("click", AClick);
            BBtn.removeEventListener("click", BClick);
            CBtn.removeEventListener("click", CClick);
            DBtn.removeEventListener("click", DClick);

            document.getElementsByClassName("qbox")[0].classList.remove("active");
        }

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
        if (!checkboxQ) {
            if (correctAnswer) {
                document.getElementById("popup-title").innerHTML = `Correct! Good job!`;
                document.getElementById("fire").innerHTML = `✅`
            }
            else {
                document.getElementById("popup-title").innerHTML = `Incorrect... Get the next one!`;
                document.getElementById("fire").innerHTML = `❌`
            }

        }  
        fullTestPopup(score_board);


    }

    function hotStreakPopup() {
        document.getElementsByClassName("popup-center")[0].classList.add("active");

        document.getElementById("score").innerHTML += ` Hot Streak of ${score_board[0]}!`;

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
        else {
            document.getElementById("dismiss-popup-btn").innerHTML = `Next Question`;
            document.getElementById("popup-title").innerHTML = questionSkipped ? `Question skipped` : `Correct!!`;
        }

        function dismissPopup() {
            if (score_board[1] == 0) {
                document.getElementById("score").innerHTML = ``;
                dismiss_btn.removeEventListener("click", dismissPopup);
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                UICtrl.removeAlbumImage();
                questionSkipped = false;
                hotStreakQuestion();
            }
            else {
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                document.getElementsByClassName("question")[0].classList.remove("active");
                document.getElementsByClassName("reset-page")[0].classList.add("active");
                dismiss_btn.removeEventListener("click", dismissPopup);
            }

        }
        console.log(score_board);

    }

    function fullTestPopup() {
        document.getElementsByClassName("popup-center")[0].classList.add("active");

        var totalQ = score_board[0] + score_board[1];

        document.getElementById("score").innerHTML += ` Score: ${score_board[0]}/${totalQ} answered`;

        dismiss_btn = document.getElementById("dismiss-popup-btn");
        dismiss_btn.addEventListener("click", dismissPopup);
        if (questionSkipped) {
            document.getElementById("popup-title").innerHTML = `Question skipped`;
            document.getElementById("fire").innerHTML = `ℹ️`;
        }

        var percentageRaw = totalQ === 0 ? 0 : score_board[0] / totalQ;
        var percentage = Math.round(percentageRaw * 10000) / 100;

        console.log(extraQuestions);
        if (!extraQuestions) {
            if (totalQ === 0) {
                document.getElementById("popup-title").innerHTML = `No score: Spotify did not provide data for any questions.`;
            }
            else if (percentageRaw >= 0.93) {
                document.getElementById("popup-title").innerHTML = ` Grade: [A] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.90 && percentageRaw < 0.93) {
                document.getElementById("popup-title").innerHTML = ` Grade: [A-] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.87 && percentageRaw < 0.9) {
                document.getElementById("popup-title").innerHTML = ` Grade: [B+] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.84 && percentageRaw < 0.87) {
                document.getElementById("popup-title").innerHTML = ` Grade: [B] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.8 && percentageRaw < 0.84) {
                document.getElementById("popup-title").innerHTML = ` Grade: [B-] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.77 && percentageRaw < 0.8) {
                document.getElementById("popup-title").innerHTML = ` Grade: [C+] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.74 && percentageRaw < 0.77) {
                document.getElementById("popup-title").innerHTML = ` Grade: [C] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.7 && percentageRaw < 0.74) {
                document.getElementById("popup-title").innerHTML = ` Grade: [C-] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.67 && percentageRaw < 0.7) {
                document.getElementById("popup-title").innerHTML = ` Grade: [D+] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.64 && percentageRaw < 0.67) {
                document.getElementById("popup-title").innerHTML = ` Grade: [D] Final score: ${percentage}%`;
            }
            else if (percentageRaw >= 0.6 && percentageRaw < 0.64) {
                document.getElementById("popup-title").innerHTML = ` Grade: [D-] Final score: ${percentage}%`;
            }
            else {
                document.getElementById("popup-title").innerHTML = ` Grade: [F] Final score: ${percentage}%`;
            }
            if (questionSkipped && totalQ > 0) {
                document.getElementById("popup-title").innerHTML += ` (question skipped)`;
            }
            document.getElementById("dismiss-popup-btn").innerHTML = `Dismiss`;

        }
        else {
            document.getElementById("dismiss-popup-btn").innerHTML = `Next Question`;
        }

        function dismissPopup() {
            if (extraQuestions) {
                document.getElementById("score").innerHTML = ``;
                dismiss_btn.removeEventListener("click", dismissPopup);
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                UICtrl.removeAlbumImage();
                questionSkipped = false;
                fullTest();
            }
            else {
                document.getElementsByClassName("popup-center")[0].classList.remove("active");
                document.getElementsByClassName("question")[0].classList.remove("active");
                document.getElementsByClassName("reset-page")[0].classList.add("active");
                dismiss_btn.removeEventListener("click", dismissPopup);
                questionSkipped = false;
            }

        }
        console.log(score_board);

    }

    function chooseQAnswerPopUp() {
        document.getElementsByClassName("popup-center")[0].classList.add("active");

        document.getElementById("score").innerHTML += ` Score ${score_board[0]} / ${score_board[1] + score_board[0]}!`;

        dismiss_btn = document.getElementById("dismiss-popup-btn");
        dismiss_btn.addEventListener("click", dismissPopup);
   
        document.getElementById("dismiss-popup-btn").innerHTML = `Next Question`;

        function dismissPopup() {
            document.getElementById("score").innerHTML = ``;
            UICtrl.removeAlbumImage();
            dismiss_btn.removeEventListener("click", dismissPopup);
            document.getElementsByClassName("popup-center")[0].classList.remove("active");
            
            document.getElementsByClassName("question")[0].classList.remove("active");
            document.getElementsByClassName("chooseQ-game")[0].classList.add("active");

            questionSkipped = false;
            chooseQuestions();
            
        }
        console.log(score_board);

    }

    play_again_btn = document.getElementById("play-again-btn");
    hsbtn = document.getElementById('hsbtn');
    hsbtn.addEventListener('click', event => {
        if (artistSelected) {
            document.getElementsByClassName("chooseGame")[0].classList.remove("active");
            document.getElementsByClassName("question")[0].classList.add("active");

            play_again_btn.addEventListener("click", playAgainHotStreak);

            hotStreakQuestion();
        }
        else {
            alert("You need to choose an artist first.")
        }
    });

    testbtn = document.getElementById('testbtn');
    testbtn.addEventListener('click', event => {
        if (artistSelected) {
            document.getElementsByClassName("chooseGame")[0].classList.remove("active");
            document.getElementsByClassName("question")[0].classList.add("active");

            play_again_btn.addEventListener("click", playAgainTest);

            fullTest();
        }
        else {
            alert("You need to choose an artist first.")
        }
    });

    chbtn = document.getElementById('chbtn');
    chbtn.addEventListener('click', event => {
        if (artistSelected) {
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
