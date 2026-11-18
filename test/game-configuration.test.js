import assert from 'node:assert/strict';
import test from 'node:test';

import {
    getQuestionDefinition,
    QUESTION_CATALOG,
    QUESTION_TYPES
} from '../src/game/question-catalog.js';
import {
    CHOOSE_QUESTION_BUTTONS
} from '../src/game/modes/choose-question.js';
import {
    FULL_TEST_QUESTION_IDS,
    getFullTestQuestion
} from '../src/game/modes/full-test.js';
import {
    HOT_STREAK_QUESTION_IDS,
    selectHotStreakQuestion
} from '../src/game/modes/hot-streak.js';
import { configureQuestionInput } from '../src/game/question-input.js';

function createQuestionInputElements() {
    return {
        questionChoices: Array.from({ length: 4 }, () => ({ style: {} })),
        answerButtons: Array.from({ length: 4 }, () => ({ style: {} })),
        checkboxes: Array.from({ length: 4 }, () => ({
            checked: true,
            parentNode: { style: {} }
        })),
        submitButton: { style: {} }
    };
}

test('every configured game mode references registered questions', () => {
    const modeQuestionIds = [
        ...HOT_STREAK_QUESTION_IDS,
        ...FULL_TEST_QUESTION_IDS,
        ...CHOOSE_QUESTION_BUTTONS.map(({ questionId }) => questionId)
    ];

    modeQuestionIds.forEach(questionId => {
        assert.ok(QUESTION_CATALOG[questionId], `${questionId} is registered`);
    });
});

test('question catalog assigns a supported answer input type', () => {
    Object.values(QUESTION_CATALOG).forEach(({ type }) => {
        assert.ok(Object.values(QUESTION_TYPES).includes(type));
    });
});

test('hot streak question selection stays within its configured list', () => {
    assert.equal(selectHotStreakQuestion(() => 0), HOT_STREAK_QUESTION_IDS[0]);
    assert.equal(
        selectHotStreakQuestion(() => 0.999999),
        HOT_STREAK_QUESTION_IDS.at(-1)
    );
});

test('full test preserves its fourteen-question sequence', () => {
    assert.equal(FULL_TEST_QUESTION_IDS.length, 14);
    assert.equal(getFullTestQuestion(0), FULL_TEST_QUESTION_IDS[0]);
    assert.equal(getFullTestQuestion(13), FULL_TEST_QUESTION_IDS[13]);
    assert.equal(getFullTestQuestion(14), null);
});

test('unknown questions and input types fail explicitly', () => {
    assert.throws(() => getQuestionDefinition('not-a-question'), /Unknown question/);
    assert.throws(
        () => configureQuestionInput('unknown-input-type', {}),
        /Unknown question input type/
    );
});

test('multiple-choice input exposes choices and hides checkbox controls', () => {
    const elements = createQuestionInputElements();

    configureQuestionInput(QUESTION_TYPES.MULTIPLE_CHOICE, elements);

    assert.ok(elements.questionChoices.every(({ style }) => style.display === 'unset'));
    assert.ok(elements.answerButtons.every(({ style }) => style.display === 'unset'));
    assert.ok(elements.checkboxes.every(({ checked, parentNode }) =>
        !checked && parentNode.style.display === 'none'));
    assert.equal(elements.submitButton.style.display, 'none');
});

test('checkbox input exposes submit controls and hides multiple-choice controls', () => {
    const elements = createQuestionInputElements();

    configureQuestionInput(QUESTION_TYPES.CHECKBOX_SELECTION, elements);

    assert.ok(elements.questionChoices.every(({ style }) => style.display === 'none'));
    assert.ok(elements.answerButtons.every(({ style }) => style.display === 'none'));
    assert.ok(elements.checkboxes.every(({ checked, parentNode }) =>
        !checked && parentNode.style.display === 'unset'));
    assert.equal(elements.submitButton.style.display, 'unset');
});
