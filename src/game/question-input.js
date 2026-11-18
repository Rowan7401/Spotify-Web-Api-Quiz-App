import { QUESTION_TYPES } from './question-catalog.js';

export function configureQuestionInput(type, {
    questionChoices,
    answerButtons,
    checkboxes,
    submitButton
}) {
    if (!Object.values(QUESTION_TYPES).includes(type)) {
        throw new Error(`Unknown question input type: ${type}`);
    }

    const isCheckboxSelection = type === QUESTION_TYPES.CHECKBOX_SELECTION;

    questionChoices.forEach(choice => {
        choice.style.display = isCheckboxSelection ? 'none' : 'unset';
    });
    answerButtons.forEach(button => {
        button.style.display = isCheckboxSelection ? 'none' : 'unset';
    });
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentNode.style.display = isCheckboxSelection ? 'unset' : 'none';
    });
    submitButton.style.display = isCheckboxSelection ? 'unset' : 'none';
}
