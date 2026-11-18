'use strict';

const PopularityMatchingQuestion = (function () {
    const ITEM_COUNT = 4;
    const itemContainer = document.getElementById('matching-items');
    const rankContainer = document.getElementById('matching-ranks');
    const status = document.getElementById('matching-status');
    const submit = document.getElementById('matching-submit');

    let questionItems = [];
    let assignments = [];
    let selectedItemIndex = null;
    let onComplete = null;

    function shuffle(items) {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
    }

    function createQuestion(items) {
        const eligibleItems = (Array.isArray(items) ? items : [])
            .filter(item => typeof item?.label === 'string'
                && item.label.trim()
                && Number.isFinite(item.popularity));

        const popularityValues = new Set(eligibleItems.map(item => item.popularity));
        if (popularityValues.size < ITEM_COUNT) {
            return null;
        }

        const uniqueByPopularity = [];
        const seenPopularity = new Set();
        for (const item of shuffle(eligibleItems)) {
            if (!seenPopularity.has(item.popularity)) {
                uniqueByPopularity.push(item);
                seenPopularity.add(item.popularity);
            }
        }

        const rankedItems = uniqueByPopularity.slice(0, ITEM_COUNT)
            .sort((left, right) => right.popularity - left.popularity)
            .map((item, index) => ({
                label: item.label,
                rank: index + 1
            }));
        return shuffle(rankedItems);
    }

    function render() {
        itemContainer.replaceChildren();
        rankContainer.replaceChildren();
        submit.disabled = true;
        selectedItemIndex = null;
        assignments = Array(ITEM_COUNT).fill(null);

        questionItems.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'matching-item';
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => selectItem(index));
            itemContainer.append(button);
        });

        for (let rank = 1; rank <= ITEM_COUNT; rank++) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'matching-rank';
            button.textContent = `${rank}${rank === 1 ? ' (most popular)' : rank === ITEM_COUNT ? ' (least popular)' : ''}`;
            button.addEventListener('click', () => assignRank(rank));
            rankContainer.append(button);
        }

        updateItems();
        status.textContent = 'Select a song or artist, then select its popularity rank.';
    }

    function selectItem(index) {
        selectedItemIndex = index;
        updateItems();
        status.textContent = `Selected ${questionItems[index].label}. Now choose a rank.`;
    }

    function assignRank(rank) {
        if (selectedItemIndex === null) {
            status.textContent = 'Select a song or artist before choosing a rank.';
            return;
        }

        const itemIndex = selectedItemIndex;
        assignments = assignments.map((assignedRank, index) =>
            index !== itemIndex && assignedRank === rank ? null : assignedRank);
        assignments[itemIndex] = rank;
        selectedItemIndex = null;

        updateItems();
        submit.disabled = assignments.some(assignedRank => assignedRank === null);
        status.textContent = submit.disabled
            ? 'Match the remaining songs or artists to their ranks.'
            : 'All matched. Submit your ranking when ready.';
    }

    function updateItems() {
        Array.from(itemContainer.children).forEach((button, index) => {
            const assignedRank = assignments[index];
            button.textContent = assignedRank
                ? `${questionItems[index].label} - Rank ${assignedRank}`
                : questionItems[index].label;
            button.setAttribute('aria-pressed', String(selectedItemIndex === index));
            button.classList.toggle('selected', selectedItemIndex === index);
        });

        Array.from(rankContainer.children).forEach((button, index) => {
            const rank = index + 1;
            const assignedItemIndex = assignments.findIndex(assignedRank => assignedRank === rank);
            button.textContent = assignedItemIndex === -1
                ? `${rank}${rank === 1 ? ' (most popular)' : rank === ITEM_COUNT ? ' (least popular)' : ''}`
                : `Rank ${rank}: ${questionItems[assignedItemIndex].label}`;
        });
    }

    submit.addEventListener('click', () => {
        if (!onComplete || assignments.some(rank => rank === null)) {
            return;
        }

        const correct = questionItems.every((item, index) => assignments[index] === item.rank);
        const complete = onComplete;
        onComplete = null;
        complete(correct);
    });

    return {
        start(items, onQuestionComplete) {
            const nextQuestion = createQuestion(items);
            if (!nextQuestion) {
                return false;
            }

            questionItems = nextQuestion;
            onComplete = onQuestionComplete;
            render();
            return true;
        }
    };
})();
