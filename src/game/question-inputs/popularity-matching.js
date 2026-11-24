'use strict';

export const PopularityMatchingQuestion = (function () {
    const ITEM_COUNT = 4;
    const itemContainer = document.getElementById('matching-items');
    const scoreContainer = document.getElementById('matching-scores');
    const status = document.getElementById('matching-status');
    const submit = document.getElementById('matching-submit');

    let questionItems = [];
    let scoreOptions = [];
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

    function createQuestion(items, requiredItemId) {
        const eligibleItems = (Array.isArray(items) ? items : [])
            .filter(item => typeof item?.label === 'string'
                && item.label.trim()
                && Number.isFinite(item.popularity));

        const distinctItems = eligibleItems.filter((item, index, list) =>
            list.findIndex(candidate => candidate.label === item.label) === index);
        if (distinctItems.length < ITEM_COUNT) {
            return null;
        }

        if (requiredItemId !== undefined && requiredItemId !== null) {
            const requiredItem = distinctItems.find(item => item.id === requiredItemId);
            if (!requiredItem) {
                return null;
            }

            const otherItems = shuffle(distinctItems.filter(item => item.id !== requiredItemId));
            return [requiredItem, ...otherItems.slice(0, ITEM_COUNT - 1)]
                .map(item => ({ label: item.label, popularity: item.popularity }));
        }

        return shuffle(distinctItems).slice(0, ITEM_COUNT)
            .map(item => ({ label: item.label, popularity: item.popularity }));
    }

    function render() {
        itemContainer.replaceChildren();
        scoreContainer.replaceChildren();
        submit.disabled = true;
        selectedItemIndex = null;
        assignments = Array(ITEM_COUNT).fill(null);
        const scoreCounts = new Map();
        questionItems.forEach(item => {
            scoreCounts.set(item.popularity, (scoreCounts.get(item.popularity) || 0) + 1);
        });
        scoreOptions = shuffle(Array.from(scoreCounts, ([popularity, count]) => ({ popularity, count })));

        questionItems.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'matching-item';
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => selectItem(index));
            itemContainer.append(button);
        });

        scoreOptions.forEach((score, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'matching-score';
            button.textContent = getScoreLabel(score);
            button.setAttribute('aria-label', `Popularity score ${getScoreLabel(score)}`);
            button.addEventListener('click', () => assignScore(index));
            scoreContainer.append(button);
        });

        updateItems();
        status.textContent = 'Select an item, then tap its popularity score.';
    }

    function selectItem(index) {
        selectedItemIndex = index;
        updateItems();
        status.textContent = `Selected ${questionItems[index].label}. Choose its popularity score.`;
    }

    function assignScore(scoreIndex) {
        if (selectedItemIndex === null) {
            status.textContent = 'Select an item before choosing a popularity score.';
            return;
        }

        const itemIndex = selectedItemIndex;
        assignments[itemIndex] = scoreIndex;
        selectedItemIndex = null;

        updateItems();
        submit.disabled = assignments.some(assignedRank => assignedRank === null);
        status.textContent = submit.disabled
            ? 'Keep matching items to their popularity scores.'
            : 'All matched. Submit your answers when ready.';
    }

    function updateItems() {
        Array.from(itemContainer.children).forEach((button, index) => {
            button.textContent = questionItems[index].label;
            button.setAttribute('aria-pressed', String(selectedItemIndex === index));
            button.classList.toggle('selected', selectedItemIndex === index);
        });

        Array.from(scoreContainer.children).forEach((button, index) => {
            const assignedItems = assignments
                .map((assignedScore, itemIndex) => assignedScore === index ? questionItems[itemIndex].label : null)
                .filter(Boolean);
            const score = scoreOptions[index];
            const scoreLabel = getScoreLabel(score);
            button.textContent = assignedItems.length === 0
                ? scoreLabel
                : `${scoreLabel} - ${assignedItems.join(', ')}`;
            button.setAttribute('aria-label', assignedItems.length === 0
                ? `Popularity score ${scoreLabel}`
                : `Popularity score ${scoreLabel}, matched to ${assignedItems.join(', ')}`);
            button.classList.toggle('assigned', assignedItems.length > 0);
            button.setAttribute('aria-pressed', String(assignedItems.length > 0));
        });
    }

    function getScoreLabel({ popularity, count }) {
        return count > 1 ? `${popularity} (x${count})` : String(popularity);
    }

    submit.addEventListener('click', () => {
        if (!onComplete || assignments.some(rank => rank === null)) {
            return;
        }

        const correct = questionItems.every((item, index) =>
            assignments[index] !== null
            && scoreOptions[assignments[index]].popularity === item.popularity);
        const correctAnswers = questionItems
            .map(({ label, popularity }) => ({ label, popularity }))
            .sort((left, right) => right.popularity - left.popularity);
        const complete = onComplete;
        onComplete = null;
        complete(correct, correctAnswers);
    });

    return {
        start(items, onQuestionComplete, requiredItemId) {
            const nextQuestion = createQuestion(items, requiredItemId);
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
