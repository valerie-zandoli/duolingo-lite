/**
 * Lesson state machine.
 * Owner: Wil (lead) — lesson state, answer checking, integration.
 *
 * Framework-agnostic on purpose: this module never touches the DOM.
 * UI modules (js/ui/*.js) read the state this returns and re-render;
 * they call these functions in response to user actions instead of
 * mutating state directly. That's what keeps "submitting twice doesn't
 * change the score" etc. enforced in one place instead of per-screen.
 *
 * State shape:
 *   {
 *     questions: Question[],
 *     index: number,          // current question, 0-based
 *     score: number,
 *     selectedChoice: number | null,  // index into current question's choices
 *     checked: boolean,       // has the current answer been submitted?
 *     lastAnswerCorrect: boolean | null,
 *     answers: { choiceIndex: number, correct: boolean }[],
 *                             // one entry per checked question, in order —
 *                             // what the completion screen reviews
 *   }
 */

/** [P2] XP for finishing a lesson: a flat reward plus a little per correct answer. */
export const XP_FOR_COMPLETING = 10;
export const XP_PER_CORRECT = 2;

export function xpForLesson(score) {
  return XP_FOR_COMPLETING + XP_PER_CORRECT * score;
}

export function createLessonState(questions) {
  return {
    questions,
    index: 0,
    score: 0,
    selectedChoice: null,
    checked: false,
    lastAnswerCorrect: null,
    answers: [],
  };
}

export function getCurrentQuestion(state) {
  return state.questions[state.index] ?? null;
}

export function isComplete(state) {
  return state.index >= state.questions.length;
}

/**
 * [P0] Change the selected choice before submitting. No-op once checked,
 * and for an index that is not one of the current question's choices
 * (the UI never sends one, but the page is open to tampering).
 */
export function selectChoice(state, choiceIndex) {
  if (state.checked) return state;
  const question = getCurrentQuestion(state);
  if (!question || !Number.isInteger(choiceIndex)) return state;
  if (choiceIndex < 0 || choiceIndex >= question.choices.length) return state;
  return { ...state, selectedChoice: choiceIndex };
}

/**
 * [P0] Check the current answer. Submitting twice does not change the
 * score — calling this again while already `checked` is a no-op.
 */
export function checkAnswer(state) {
  if (state.checked || state.selectedChoice === null) return state;

  const question = getCurrentQuestion(state);
  const picked = question.choices[state.selectedChoice];
  const correct = picked === question.correct;

  return {
    ...state,
    checked: true,
    lastAnswerCorrect: correct,
    score: correct ? state.score + 1 : state.score,
    answers: [...state.answers, { choiceIndex: state.selectedChoice, correct }],
  };
}

/** [P0] Advance only after the current answer has been checked. */
export function nextQuestion(state) {
  if (!state.checked) return state;
  return {
    ...state,
    index: state.index + 1,
    selectedChoice: null,
    checked: false,
    lastAnswerCorrect: null,
  };
}

/** [P0] Restart from question one with a reset score and progress bar. */
export function restart(state) {
  return createLessonState(state.questions);
}
