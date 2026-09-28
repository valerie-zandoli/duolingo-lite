/**
 * App entry point — integration.
 * Owner: Wil (lead) — lesson state, answer checking, integration, final
 * release.
 *
 * This is the only file that imports both state/ and ui/. UI modules
 * should never import each other or reach into lesson-state.js
 * directly — they receive `state` as a plain object and report user
 * actions back through the callbacks passed in here. Keep it that way;
 * it's what lets Valerie and Priscilla build their screens without
 * stepping on each other's files.
 */

import { QUESTIONS } from "./data/questions.js";
import {
  createLessonState,
  selectChoice,
  checkAnswer,
  nextQuestion,
  restart,
  isComplete,
  xpForLesson,
} from "./state/lesson-state.js";
import { createXpStore } from "./state/xp-store.js";
import { renderQuestionScreen } from "./ui/question-screen.js";
import { renderFeedback } from "./ui/feedback.js";
import { renderCompletionScreen } from "./ui/completion-screen.js";

const root = document.getElementById("app");
const xpStore = createXpStore();

let state = createLessonState(QUESTIONS);
/** XP awarded for the lesson just finished: { earned, previous, total }, or null. */
let reward = null;

function render() {
  const totalXp = xpStore.total();
  root.innerHTML = `
    <div class="app-shell">
      <div class="card">
        <header class="card__header lesson-header">
          <h1 class="lesson-header__title">Spanish · Beginner words</h1>
          <span class="lesson-header__xp" aria-label="Total XP: ${totalXp}">
            <span aria-hidden="true">⚡</span> ${totalXp} XP
          </span>
        </header>
        <div class="card__body" data-role="screen"></div>
      </div>
    </div>
  `;

  const screen = root.querySelector("[data-role='screen']");

  if (isComplete(state)) {
    renderCompletionScreen(state, screen, { onRestart: handleRestart, xp: reward });
    return;
  }

  // The primary button's job is fixed when it is rendered: Check before
  // the answer is checked, Continue after. Binding the handler here
  // (instead of re-pointing the button afterwards) means one click runs
  // exactly one handler and one render, and a stale, already-replaced
  // button can never act on the next question.
  renderQuestionScreen(state, screen, {
    onSelectChoice: handleSelectChoice,
    onCheck: state.checked ? handleNext : handleCheck,
  });

  const feedbackHtml = renderFeedback(state);
  if (feedbackHtml) {
    screen.insertAdjacentHTML("beforeend", feedbackHtml);
  }

  if (state.checked) {
    const btn = screen.querySelector("[data-role='check-btn']");
    btn.textContent = state.index === state.questions.length - 1 ? "See results" : "Continue";
  }
}

function handleSelectChoice(choiceIndex) {
  state = selectChoice(state, choiceIndex);
  render();
}

function handleCheck() {
  state = checkAnswer(state);
  render();
}

function handleNext() {
  state = nextQuestion(state);
  // Award once, on the move into the completion screen. A second click
  // on a stale Continue button leaves `state` unchanged and `reward` set.
  if (isComplete(state) && reward === null) {
    const earned = xpForLesson(state.score);
    reward = { earned, ...xpStore.add(earned) };
  }
  render();
}

function handleRestart() {
  state = restart(state);
  reward = null;
  render();
}

// Number keys 1–4 pick an answer, as in the PRD demo. Enter and Space
// already press whichever button has focus, so they need nothing here.
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (isComplete(state) || state.checked) return;
  const n = Number.parseInt(event.key, 10);
  if (n >= 1 && n <= state.questions[state.index].choices.length) {
    event.preventDefault();
    handleSelectChoice(n - 1);
  }
});

render();
