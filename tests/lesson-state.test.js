/**
 * Tests for the lesson state machine (js/state/lesson-state.js).
 * No dependencies: uses Node's built-in test runner.
 *
 * Run from the repo root (needs Node 22.7 or newer, which loads this
 * project's ES modules without a package.json "type" field):
 *
 *   node --test "tests/*.test.js"
 *
 * Each test maps to a line in the PRD's requirements or acceptance
 * criteria, named in the test title.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  createLessonState,
  getCurrentQuestion,
  isComplete,
  selectChoice,
  checkAnswer,
  nextQuestion,
  restart,
  xpForLesson,
  XP_FOR_COMPLETING,
  XP_PER_CORRECT,
} from "../js/state/lesson-state.js";
import { QUESTIONS } from "../js/data/questions.js";

/** Deep-freeze so any accidental mutation throws instead of passing silently. */
function deepFreeze(value) {
  Object.values(value).forEach((v) => typeof v === "object" && v !== null && deepFreeze(v));
  return Object.freeze(value);
}

const fresh = () => createLessonState(QUESTIONS);
const correctIndex = (state) => {
  const q = getCurrentQuestion(state);
  return q.choices.indexOf(q.correct);
};
const wrongIndex = (state) => (correctIndex(state) === 0 ? 1 : 0);

/** Answer the current question, then move on. */
function answer(state, pickCorrect) {
  let s = selectChoice(state, pickCorrect ? correctIndex(state) : wrongIndex(state));
  s = checkAnswer(s);
  return nextQuestion(s);
}

test("starts at question one with a zero score and nothing selected", () => {
  const s = fresh();
  assert.equal(s.index, 0);
  assert.equal(s.score, 0);
  assert.equal(s.selectedChoice, null);
  assert.equal(s.checked, false);
  assert.equal(s.lastAnswerCorrect, null);
  assert.equal(isComplete(s), false);
  assert.equal(getCurrentQuestion(s).word, "hola");
});

test("[P0] user can change the selected choice before submitting", () => {
  let s = selectChoice(fresh(), 1);
  assert.equal(s.selectedChoice, 1);
  s = selectChoice(s, 3);
  assert.equal(s.selectedChoice, 3);
});

test("[P0] the selection is locked once the answer is checked", () => {
  let s = checkAnswer(selectChoice(fresh(), 0));
  const after = selectChoice(s, 2);
  assert.equal(after.selectedChoice, 0);
  assert.equal(after, s, "returns the same state object");
});

test("[P0] checking with nothing selected does nothing", () => {
  const s = fresh();
  assert.equal(checkAnswer(s), s);
});

test("[P0] a correct answer scores exactly one point", () => {
  const s0 = fresh();
  const s = checkAnswer(selectChoice(s0, correctIndex(s0)));
  assert.equal(s.score, 1);
  assert.equal(s.checked, true);
  assert.equal(s.lastAnswerCorrect, true);
});

test("[P0] a wrong answer scores nothing and is marked incorrect", () => {
  const s0 = fresh();
  const s = checkAnswer(selectChoice(s0, wrongIndex(s0)));
  assert.equal(s.score, 0);
  assert.equal(s.checked, true);
  assert.equal(s.lastAnswerCorrect, false);
});

test("[P0] submitting twice does not change the score", () => {
  const s0 = fresh();
  const once = checkAnswer(selectChoice(s0, correctIndex(s0)));
  const twice = checkAnswer(once);
  const thrice = checkAnswer(twice);
  assert.equal(twice.score, 1);
  assert.equal(thrice.score, 1);
  assert.equal(twice, once, "second submit returns the same state object");
});

test("[P0] user can advance only after checking the current answer", () => {
  const unchecked = selectChoice(fresh(), 0);
  assert.equal(nextQuestion(unchecked), unchecked);
  assert.equal(nextQuestion(fresh()).index, 0);
});

test("advancing moves to the next question and clears selection and feedback", () => {
  const s0 = fresh();
  const s = nextQuestion(checkAnswer(selectChoice(s0, correctIndex(s0))));
  assert.equal(s.index, 1);
  assert.equal(s.selectedChoice, null);
  assert.equal(s.checked, false);
  assert.equal(s.lastAnswerCorrect, null);
  assert.equal(s.score, 1, "score carries over");
});

test("[P0] the lesson completes after exactly five answered questions", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) {
    assert.equal(isComplete(s), false, `not complete before question ${i + 1}`);
    s = answer(s, true);
  }
  assert.equal(isComplete(s), true);
  assert.equal(s.score, 5);
});

test("a mixed run scores only the correct answers", () => {
  let s = fresh();
  for (const pickCorrect of [true, false, true, false, true]) s = answer(s, pickCorrect);
  assert.equal(isComplete(s), true);
  assert.equal(s.score, 3);
});

test("[P0] restart returns to question one with a reset score and progress", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = answer(s, true);
  const again = restart(s);
  assert.equal(again.index, 0);
  assert.equal(again.score, 0);
  assert.equal(again.selectedChoice, null);
  assert.equal(again.checked, false);
  assert.equal(isComplete(again), false);
});

test("restart works in the middle of a lesson too", () => {
  let s = answer(answer(fresh(), true), false);
  s = selectChoice(s, 2);
  const again = restart(s);
  assert.equal(again.index, 0);
  assert.equal(again.selectedChoice, null);
});

test("no function mutates the state it receives", () => {
  const frozen = deepFreeze(fresh());
  const s1 = selectChoice(frozen, 1);
  const s2 = checkAnswer(s1);
  const s3 = nextQuestion(deepFreeze(s2));
  restart(deepFreeze(s3));
  assert.equal(frozen.selectedChoice, null);
});

test("getCurrentQuestion returns null once the lesson is complete", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = answer(s, true);
  assert.equal(getCurrentQuestion(s), null);
});

test("ignores a selection that is not one of the four choices", () => {
  const start = selectChoice(fresh(), 1);
  for (const bad of [9, 4, -1, 1.5, NaN, Infinity, "2", null, undefined, {}]) {
    assert.equal(selectChoice(start, bad), start, `index ${String(bad)} is ignored`);
  }
  assert.equal(selectChoice(start, 0).selectedChoice, 0, "0 is still valid");
  assert.equal(selectChoice(start, 3).selectedChoice, 3, "3 is still valid");
});

test("an ignored selection cannot be scored", () => {
  const s = checkAnswer(selectChoice(fresh(), 9));
  assert.equal(s.checked, false, "nothing was selected, so nothing is checked");
  assert.equal(s.score, 0);
});

test("selecting does nothing once the lesson is complete", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = answer(s, true);
  assert.equal(selectChoice(s, 0), s);
});

// --- answer review and XP (completion screen, PRD [P2]) --------------------------

test("records each checked answer, in order, for the completion review", () => {
  let s = fresh();
  s = answer(s, true);
  s = answer(s, false);
  assert.equal(s.answers.length, 2);
  assert.equal(s.answers[0].correct, true);
  assert.equal(s.answers[0].choiceIndex, QUESTIONS[0].choices.indexOf(QUESTIONS[0].correct));
  assert.equal(s.answers[1].correct, false);
  assert.notEqual(QUESTIONS[1].choices[s.answers[1].choiceIndex], QUESTIONS[1].correct);
});

test("a finished lesson has exactly one answer per question, matching the score", () => {
  let s = fresh();
  for (const pick of [true, false, true, true, false]) s = answer(s, pick);
  assert.equal(s.answers.length, 5);
  assert.equal(s.answers.filter((a) => a.correct).length, s.score);
  assert.equal(s.score, 3);
});

test("submitting twice records the answer only once", () => {
  let s = checkAnswer(selectChoice(fresh(), 0));
  s = checkAnswer(s);
  assert.equal(s.answers.length, 1);
});

test("restart clears the recorded answers", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = answer(s, true);
  assert.deepEqual(restart(s).answers, []);
});

test("[P2] lesson XP is a flat reward plus a little per correct answer", () => {
  assert.equal(xpForLesson(0), XP_FOR_COMPLETING);
  assert.equal(xpForLesson(5), XP_FOR_COMPLETING + 5 * XP_PER_CORRECT);
  assert.ok(xpForLesson(3) > xpForLesson(2), "more correct answers earn more XP");
});
