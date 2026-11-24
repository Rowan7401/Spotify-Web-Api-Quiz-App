export const UIController = (function () {
    const q1 = document.getElementById('q1');
    const q2 = document.getElementById('q2');
    const q3 = document.getElementById('q3');
    const q4 = document.getElementById('q4');
    const answerButtons = ['Abtn', 'Bbtn', 'Cbtn', 'Dbtn']
        .map(id => document.getElementById(id));
    const submit = document.getElementById('submit');

    //object to hold references to html selectors
    const DOMElements = {
        hfToken: '#hidden_token',
        selectArtist: '#select_artist',
        divRanking: '#artist-ranking',
        divAlbumDetail: '#album-detail',
        divArtistDetail: '#artist-detail'
    }
    const ANSWER_ORDERS = [
        [0, 1, 2, 3],
        [1, 0, 3, 2],
        [2, 1, 0, 3],
        [1, 2, 3, 0]
    ];

    function appendImageBlock(containerSelector, img, name, alt) {
        const container = document.querySelector(containerSelector);
        const heading = document.createElement('span');
        heading.className = 'artistHeader';
        heading.textContent = `${name}:`;
        container.append(heading);

        if (typeof img === 'string' && img.startsWith('https://')) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'form-label col-sm-12 px-0';

            const image = document.createElement('img');
            image.src = img;
            image.alt = alt;
            imageContainer.append(image);
            container.append(imageContainer);
        }
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
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Select an artist from the dropdown...';
            return document.querySelector(DOMElements.selectArtist).append(option);
        },
        createArtist(text, value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            return document.querySelector(DOMElements.selectArtist).append(option);
        },
        createArtistImage(img, name) {
            appendImageBlock(DOMElements.divArtistDetail, img, name, `${name} artist image`);
        },
        createAlbumImage(img, name) {
            appendImageBlock(DOMElements.divAlbumDetail, img, name, `${name} album image`);
        },
        showStatus(message, isError = false) {
            const status = document.getElementById('api-status');
            status.textContent = message;
            status.classList.toggle('error', isError);
        },
        setQuestionText(text) {
            document.getElementById('hot-streak-q').textContent = text;
        },
        setMultipleChoiceChoices(choices) {
            ['q1', 'q2', 'q3', 'q4'].forEach((id, index) => {
                document.getElementById(id).textContent = choices[index] ?? '';
            });
        },
        setCheckboxChoices(choices) {
            ['label1', 'label2', 'label3', 'label4'].forEach((id, index) => {
                document.getElementById(id).textContent = choices[index] ?? '';
            });
        },
        formatMultipleChoiceAnswers(answers, correctSpot) {
            return ANSWER_ORDERS[correctSpot].map((answerIndex, index) =>
                `${String.fromCharCode(65 + index)}: ${answers[answerIndex]}`);
        },
        appendScore(text) {
            const score = document.getElementById('score');
            score.textContent += text;
        },
        getImageUrl(images) {
            if (!Array.isArray(images) || images.length === 0) {
                return null;
            }
            const image = images.find(item => item && typeof item.url === 'string'
                && item.url.startsWith('https://'));
            return image ? image.url : null;
        },
        showMissingData(dataName) {
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");
            this.setQuestionText(`Sorry, Spotify does not have enough ${dataName} data for this artist to create this question. Skipping it.`);

            for (let i = 1; i <= 4; i++) {
                document.getElementById(`q${i}`).textContent = '';
                const checkbox = document.getElementById(`checkbox${i}`);
                checkbox.checked = false;
                checkbox.parentNode.style.display = 'none';
            }
            document.getElementById('submit').style.display = 'none';
            answerButtons.forEach(button => {
                if (button) {
                    button.style.display = 'none';
                }
            });
            return false;
        },
        removeAlbumImage() {
            this.inputField().AlbumDetail.textContent = '';
        },
        popularity(artist, mc_spots) {
            if (!Number.isFinite(artist?.popularity)) {
                return this.showMissingData('artist popularity');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            this.setQuestionText(`What does Spotify rate ${artist.name}'s popularity? (100 = most popular)`);

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

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

        },
        followers(artist, mc_spots) {
            if (!Number.isFinite(artist?.followers?.total)) {
                return this.showMissingData('artist follower');
            }
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            this.setQuestionText(`How many followers on Spotify does ${artist.name} have?`);

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

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

        },
        genres(artist, recordAnswer) {
            const artistGenres = Array.isArray(artist?.genres)
                ? artist.genres.filter(genre => typeof genre === 'string' && genre.trim())
                : [];
            if (artistGenres.length === 0) {
                return this.showMissingData('artist genre');
            }
            const submitButton = document.getElementById("submit");
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            this.setQuestionText(`What genre(s) does Spotify not label ${artist.name} with?`);

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

            this.setCheckboxChoices(mc);

            submitButton.addEventListener("click", submitAnswer);
            function submitAnswer(event) {
                console.log("submit clicked")
                if (real_genres.length == 1) {
                    if (document.getElementById("checkbox2").checked
                        && document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox4").checked
                        && document.getElementById("checkbox1").checked == false) {
                        recordAnswer(true);
        
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[1]}, ${mc[2]}, ${mc[3]}`);
                }
                else if (real_genres.length == 2) {
                    if (document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox4").checked
                        && document.getElementById("checkbox1").checked == false
                        && document.getElementById("checkbox2").checked == false) {
                        recordAnswer(true);
                        
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[2]}, ${mc[3]}`);
                }
                else {
                    if (document.getElementById("checkbox4").checked && document.getElementById("checkbox1").checked == false
                        && document.getElementById("checkbox2").checked == false && document.getElementById("checkbox3").checked == false) {
                        recordAnswer(true);
                      
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[3]}`);
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

            this.setQuestionText(`What are ${artist.name}'s hottest 3 tracks currently?`);

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

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

        },
        related(artist, relatedArtists, recordAnswer, mc_spots) {
            document.getElementsByClassName("album-detail")[0].classList.remove("active");
            document.getElementsByClassName("artist-detail")[0].classList.add("active");

            this.setQuestionText(`Which of these names does Spotify designate as ${artist.name}'s
             "related" artists?`);

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

            this.setCheckboxChoices(mc);

            submit.addEventListener("click", submitAnswer);
            function submitAnswer(event) {
                if (mc_spots == 0) {
                    if (document.getElementById("checkbox1").checked == false && document.getElementById("checkbox3").checked
                        && document.getElementById("checkbox2").checked == false && document.getElementById("checkbox4").checked == false) {
                        recordAnswer(true);
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[2]}`);
                }
                else if (mc_spots == 1) {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked == false
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked == false) {
                        recordAnswer(true);
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[0]}, ${mc[2]}`);
                }
                else if (mc_spots == 2) {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked == false
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked) {
                        recordAnswer(true);
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[0]}, ${mc[2]}, ${mc[3]}`);
                }
                else {
                    if (document.getElementById("checkbox1").checked && document.getElementById("checkbox2").checked
                        && document.getElementById("checkbox3").checked && document.getElementById("checkbox4").checked) {
                        recordAnswer(true);
                        document.getElementById("popup-title").textContent = `Correct! Good job!`;
                        document.getElementById("fire").textContent = `✅`

                    }
                    else {
                        recordAnswer(false);
                        document.getElementById("popup-title").textContent = `Incorrect... Get the next one!`;
                        document.getElementById("fire").textContent = `❌`

                    }
                    UIController.appendScore(`Answer: ${mc[1]}, ${mc[2]}, ${mc[3]}, ${mc[0]}`);
                }
                submit.removeEventListener("click", submitAnswer);
                document.getElementById("checkbox1").parentNode.style.display = 'none';
                document.getElementById("checkbox2").parentNode.style.display = 'none';
                document.getElementById("checkbox3").parentNode.style.display = 'none';
                document.getElementById("checkbox4").parentNode.style.display = 'none';
                document.getElementsByClassName("qbox")[0].classList.remove("active");
            }

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
            let real_track;
            let fake_track1;
            let fake_track2;
            let fake_track3;
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

            this.setQuestionText(`What is the release date of "${song_name}"?`);

            var answers = [real_track, fake_track1, fake_track2, fake_track3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);
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
            let real_track;
            let fake_track1;
            let fake_track2;
            let fake_track3;
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

            this.setQuestionText(`How long is "${song_name}"?`);


            var answers = [real_track, fake_track1, fake_track2, fake_track3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

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
            let real_track;
            let fake_track1;
            let fake_track2;
            let fake_track3;
            var n = 4;
            do {
                const randomNumber = Math.floor(Math.random() * 10);

                if (!random_nums.includes(randomNumber)) {
                    random_nums.push(randomNumber);
                }

            } while (random_nums.length < n);

            var song_name = top_tracks[random_nums[0]].name;

            if (mc_spots == 0) {
                this.setQuestionText(`What does Spotify rate the danceability of "${song_name}"? (0-1 scale)`);
                real_track = top_tracks_analysis[random_nums[0]].danceability;
                fake_track1 = top_tracks_analysis[random_nums[1]].danceability;
                fake_track2 = top_tracks_analysis[random_nums[2]].danceability;
                fake_track3 = top_tracks_analysis[random_nums[3]].danceability;
            }
            else if (mc_spots == 1) {
                this.setQuestionText(`What does Spotify rate the acousticness of "${song_name}"? (0-1 scale)`);
                real_track = top_tracks_analysis[random_nums[0]].acousticness;
                fake_track1 = top_tracks_analysis[random_nums[1]].acousticness;
                fake_track2 = top_tracks_analysis[random_nums[2]].acousticness;
                fake_track3 = top_tracks_analysis[random_nums[3]].acousticness;
            }
            else if (mc_spots == 2) {
                this.setQuestionText(`What does Spotify rate the energy of "${song_name}"? (0-1 scale)`);
                real_track = top_tracks_analysis[random_nums[0]].energy;
                fake_track1 = top_tracks_analysis[random_nums[1]].energy;
                fake_track2 = top_tracks_analysis[random_nums[2]].energy;
                fake_track3 = top_tracks_analysis[random_nums[3]].energy;
            }
            else {
                this.setQuestionText(`What does Spotify rate the tempo of "${song_name}"? (bpm)`);
                real_track = top_tracks_analysis[random_nums[0]].tempo;
                fake_track1 = top_tracks_analysis[random_nums[1]].tempo;
                fake_track2 = top_tracks_analysis[random_nums[2]].tempo;
                fake_track3 = top_tracks_analysis[random_nums[3]].tempo;
            }

            var answers = [real_track, fake_track1, fake_track2, fake_track3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

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

            this.setQuestionText(`What is the popularity of "${song_name}"? (100 = most popular)`);

            var answers = [real_track, fake_track1, fake_track2, fake_track3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);


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

            this.setQuestionText(`How many official albums does ${artist_name} have under their name?
            (not updated recently..)`);

            var answers = [real_albums, fake_albums1, fake_albums2, fake_albums3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

        },
        albumTrackCount(albums, mc_spots, randomAlbumIndex) {
            const album = albums?.[randomAlbumIndex];
            if (!Number.isFinite(album?.total_tracks) || album.total_tracks < 0) {
                return this.showMissingData('album track count');
            }
            document.getElementsByClassName("artist-detail")[0].classList.remove("active");
            document.getElementsByClassName("album-detail")[0].classList.add("active");

            const real_track_count = album.total_tracks;

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

            this.setQuestionText(`How many tracks does "${album.name || 'this album'}" have?`);


            var answers = [real_track_count, fake_track_count1, fake_track_count2, fake_track_count3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

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
            let real_album_rel = releaseDateAlbum.release_date;
            let fake_album_rel1 = albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)].release_date;
            let fake_album_rel2 = albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)].release_date;
            let fake_album_rel3 = albumsWithReleaseDates[Math.floor(Math.random() * albumsWithReleaseDates.length)].release_date;

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


            this.setQuestionText(`When was "${releaseDateAlbum.name || 'this album'}" released?`);

            const answers = [real_album_rel, fake_album_rel1, fake_album_rel2, fake_album_rel3];

            var mc = this.formatMultipleChoiceAnswers(answers, mc_spots);


            this.setMultipleChoiceChoices(mc);

            UIController.appendScore(`Answer: ${answers[0]}`);

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
