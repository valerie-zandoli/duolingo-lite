# Demo test checklist

Owner: Priscilla. Run this end-to-end before any demo — golden path first,
then edge cases. Status reflects a full run against `main` after
`feature/feedback-completion` and `feature/question-screen` merged.

## Golden path (all 5 questions, mixed correct/incorrect)

| Step | Expected | Status |
|---|---|---|
| Load app | First question ("hola") renders, progress shows 0/5 | ✅ Pass |
| Click a choice | Choice visually marked selected (`.choice--selected`), Check button enables | ✅ Pass |
| Click Check (correct answer) | Feedback banner shows "Correct!", choice marked `.choice--correct` | ✅ Pass |
| Click Check (incorrect answer) | Feedback banner reveals the correct answer, wrong choice marked `.choice--wrong`, correct choice marked `.choice--correct` | ✅ Pass |
| Choices disabled after checking | All four choice buttons `disabled` once checked | ✅ Pass — confirmed via DOM inspection |
| Click Check twice | Score doesn't change on the second click | ✅ Pass — button relabels to "Continue" after the first check, so there's no way to re-check from the UI |
| Click Continue | Advances to next question, resets selection/checked state | ✅ Pass |
| Progress bar | `.progress-fill` width and `.progress-count` (`n/5`) update each question | ✅ Pass |
| After question 5 | Completion screen shows score `x / 5`, a message and icon for how it went, and a restart button | ✅ Pass |
| Completion review | One row per word: Spanish word, the right answer, ✓ or ✕, and "You picked …" on a miss | ✅ Pass |
| [P2] XP reward | `+XP` pill for the lesson (10 for finishing + 2 per correct answer), awarded once even on a double click | ✅ Pass |
| [P2] XP retained locally | Header and completion screen show the running total; it grows across lessons and survives a refresh | ✅ Pass |
| Completion animation | Trophy pop, XP count-up, rows rising in, confetti for 3/5 or better | ✅ Pass |
| Keys 1–4 | Pick the matching answer before checking; ignored after | ✅ Pass |
| Click "Try again" | Returns to question 1 with score/progress reset | ✅ Pass |
| [P0] RuneSpeak link | "Continue in RuneSpeak" link on the completion screen, after Try again, opens https://wiltobuild.github.io/RuneSpeak/ in a new tab (`target="_blank" rel="noopener noreferrer"`), present at every score | ✅ Pass |
| Refresh mid-lesson | Fresh lesson loads, no broken screen | ✅ Pass |
| Phone width (~375px) | No horizontal overflow, choices/progress bar readable | ✅ Pass |

Full run: 5/5 questions answered (4 correct, 1 incorrect on purpose to
exercise the wrong-answer path), completion screen showed `4 / 5`
correctly with the miss reviewed, +18 XP awarded, the total carried
into the next lesson, restart worked, no console errors at any point.
Checked at 375px in both themes.

## Accessibility

| Check | Status |
|---|---|
| Feedback banner announced to screen readers (`role="status"`, `aria-live="polite"`) | ✅ Pass |
| Progress bar has `role="progressbar"` + `aria-valuenow`/`aria-valuemax` | ✅ Pass |
| Choice buttons expose selection via `aria-pressed` | ✅ Pass |
| Visible focus state on interactive elements (`:focus-visible` in base.css, not overridden anywhere) | ✅ Pass — confirmed live via Tab key |
| Keyboard focus preserved across re-renders (question screen rebuilds the DOM on every state change) | ✅ Pass — `restoreFocus()` in `question-screen.js` moves focus to the right element after selecting, checking, or advancing |
| Reduced-motion respected | ✅ Pass — `@media (prefers-reduced-motion: reduce)` in base.css disables all transitions/animations globally; the confetti is also hidden, and the XP count-up (JavaScript) checks the setting itself |
| Color contrast — feedback banner text, `.btn-primary`, completion score, XP pill | ✅ Pass (4.5:1+ in both themes — see `css/tokens.css` for the contrast-fix history) |
| Color contrast — header, completion message and captions, review rows (word, answer, marks, "You picked") | ✅ Pass — 4.5:1 or better in both themes (lowest: the ✕ mark at 4.52:1 in light) |
| Review rows don't rely on color | ✅ Pass — ✓/✕ symbols, plus "(correct)" / "You picked …" text |
| Completion screen announced to screen readers / focus moved on arrival | ✅ Pass — focus moves to the "Lesson complete" heading, which names the screen's region |

## Remaining polish (non-blocking)

None open. Not built, on purpose: resuming an unfinished lesson after a
refresh (P2) — a refresh still starts a fresh lesson, which is the P0
behavior the PRD asks for.

## Retest triggers

Re-run the full golden path above whenever `js/state/lesson-state.js`,
`js/ui/question-screen.js`, `js/ui/feedback.js`, or
`js/ui/completion-screen.js` change, and after any change to
`js/state/xp-store.js` or `js/app.js`.
