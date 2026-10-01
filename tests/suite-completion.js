/**
 * Completion screen, XP, and keyboard shortcut tests, run against the
 * real app in an iframe. Each test clears the stored XP total first and
 * puts the tester's own total back afterwards.
 */

import { test, assert, eq, QUESTIONS, loadApp, answerCurrent, indexes } from "./harness.js";
import { STORAGE_KEY } from "../js/state/xp-store.js";
import { xpForLesson } from "../js/state/lesson-state.js";

async function withFreshXp(fn) {
  const saved = localStorage.getItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  const app = await loadApp();
  try {
    await fn(app);
    eq(app.errors.length, 0, `console errors: ${app.errors.join(" | ")}`);
  } finally {
    app.close();
    if (saved === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, saved);
  }
}

/** Finish a lesson through the real UI, one pick per question. */
function finish(app, pattern) {
  pattern.forEach((pickCorrect) => answerCurrent(app, pickCorrect));
}

const headerXp = (app) => app.q(".lesson-header__xp").getAttribute("aria-label");

test("[completion] the review lists every question, marks right and wrong, and names the wrong pick", () =>
  withFreshXp(async (app) => {
    const pattern = [true, false, true, true, false];
    finish(app, pattern);

    const rows = app.qa(".review-item");
    eq(rows.length, 5, "one row per question");
    rows.forEach((row, i) => {
      const q = QUESTIONS[i];
      eq(row.querySelector(".review-item__word").textContent, q.word);
      eq(row.querySelector(".review-item__word").getAttribute("lang"), "es");
      eq(row.querySelector(".review-item__answer").textContent, q.correct, "shows the right answer");
      eq(row.classList.contains("review-item--correct"), pattern[i]);
      eq(row.querySelector(".review-item__mark").textContent, pattern[i] ? "✓" : "✕", "a symbol, not only a color");
      if (!pattern[i]) {
        const wrongPick = q.choices[indexes(q).wrong];
        assert(row.querySelector(".review-item__picked").textContent.includes(wrongPick), "names the learner's pick");
      }
    });
    eq(app.q(".completion__score").textContent, "3 / 5");
  }));

test("[P2] the lesson awards XP once, and the total accumulates across lessons", () =>
  withFreshXp(async (app) => {
    eq(headerXp(app), "Total XP: 0");

    finish(app, [true, true, true, true, true]);
    const first = xpForLesson(5);
    assert(app.q(".xp-pill").textContent.includes(`+${first} XP`), "shows the XP earned");
    eq(app.q("[data-role='xp-total']").getAttribute("aria-label") ?? app.q("[data-role='xp-total']").textContent, String(first));
    eq(headerXp(app), `Total XP: ${first}`);

    app.q("[data-role='restart-btn']").click();
    finish(app, [false, false, false, false, false]);
    const second = xpForLesson(0);
    assert(app.q(".xp-pill").textContent.includes(`+${second} XP`));
    eq(headerXp(app), `Total XP: ${first + second}`);
    eq(localStorage.getItem(STORAGE_KEY), String(first + second), "saved on this device");
  }));

test("[P2] the total survives a refresh", () =>
  withFreshXp(async (app) => {
    finish(app, [true, true, false, false, false]);
    app.win.location.reload();
    await new Promise((resolve) => (app.frame.onload = resolve));
    const doc = app.frame.contentDocument;
    for (let i = 0; i < 50 && !doc.querySelector(".lesson-header__xp"); i++) await new Promise((r) => setTimeout(r, 20));
    eq(doc.querySelector(".lesson-header__xp").getAttribute("aria-label"), `Total XP: ${xpForLesson(2)}`);
  }));

test("a double-click on See results awards XP only once", () =>
  withFreshXp(async (app) => {
    for (let i = 0; i < 4; i++) answerCurrent(app, true);
    const { correct } = indexes(QUESTIONS[4]);
    app.qa(".choice")[correct].click();
    app.q("[data-role='check-btn']").click(); // Check
    const stale = app.q("[data-role='check-btn']");
    stale.click(); // See results
    stale.click(); // the same, now detached, button again
    eq(headerXp(app), `Total XP: ${xpForLesson(5)}`);
  }));

test("[a11y] focus lands on the completion heading, so the new screen is announced", () =>
  withFreshXp(async (app) => {
    finish(app, [true, false, true, false, true]);
    const heading = app.q(".completion__title");
    eq(app.doc.activeElement, heading, "focus is on the heading, not the page body");
    eq(heading.tagName, "H2");
    eq(app.q(".completion").getAttribute("aria-labelledby"), heading.id, "the screen is named by its heading");
  }));

test("confetti celebrates a good lesson only, and is hidden from screen readers", () =>
  withFreshXp(async (app) => {
    finish(app, [true, true, true, false, false]);
    const burst = app.q(".confetti");
    assert(burst, "3 of 5 gets confetti");
    eq(burst.getAttribute("aria-hidden"), "true");

    app.q("[data-role='restart-btn']").click();
    finish(app, [true, false, false, false, false]);
    eq(app.q(".confetti"), null, "1 of 5 does not");
  }));

test("[keyboard] number keys 1–4 pick an answer, and do nothing once it is checked", () =>
  withFreshXp(async (app) => {
    const press = (key) => app.doc.dispatchEvent(new app.win.KeyboardEvent("keydown", { key, bubbles: true }));
    press("3");
    eq(app.qa(".choice")[2].classList.contains("choice--selected"), true, "3 selects the third choice");
    eq(app.doc.activeElement, app.q("[data-role='check-btn']"), "focus moves to Check, so Enter checks the answer next");
    eq(app.doc.activeElement.disabled, false, "Check is focused and enabled, not stuck disabled");
    press("1");
    eq(app.qa(".choice")[0].classList.contains("choice--selected"), true, "the pick can change");
    press("9");
    eq(app.qa(".choice")[0].classList.contains("choice--selected"), true, "keys past 4 are ignored");

    app.q("[data-role='check-btn']").click();
    press("2");
    eq(app.qa(".choice--selected").length, 0, "no selection after checking");
    assert(app.qa(".choice").every((b) => b.disabled));
  }));

test("[P0] the completion screen links to RuneSpeak, safely, in a new tab", () =>
  withFreshXp(async (app) => {
    finish(app, [true, false, true, false, true]);
    const link = app.q("a.btn-secondary");
    assert(link, "a link exists on the completion screen");
    eq(link.getAttribute("href"), "https://wiltobuild.github.io/RuneSpeak/");
    eq(link.getAttribute("target"), "_blank", "opens in a new tab, so Try again is still here on return");
    eq(link.getAttribute("rel"), "noopener noreferrer", "the new tab cannot reach back into this page");
    assert(link.textContent.includes("RuneSpeak"), "the link names its destination");

    const buttons = [...app.q(".completion").querySelectorAll("button, a")];
    eq(buttons[0].dataset.role, "restart-btn", "Try again comes first");
    eq(buttons[1], link, "the RuneSpeak link comes second, after the primary action");
  }));

test("the RuneSpeak link appears regardless of score", () =>
  withFreshXp(async (app) => {
    finish(app, [true, true, true, true, true]);
    assert(app.q("a.btn-secondary"), "present on a perfect run");

    app.q("[data-role='restart-btn']").click();
    finish(app, [false, false, false, false, false]);
    assert(app.q("a.btn-secondary"), "present on an all-wrong run too");
  }));
