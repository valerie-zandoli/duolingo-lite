/**
 * Completion screen.
 * Owner: Priscilla — feedback and completion screens, accessibility
 * review, demo test checklist.
 *
 * app.js calls this instead of renderQuestionScreen once
 * isComplete(state) is true, and passes the XP numbers in `xp` — this
 * module never reads storage itself.
 *
 * Done:
 *   [P0] Score out of five (state.score / state.questions.length).
 *   [P0] "Try again" restarts the lesson (onRestart).
 *   [P0] A link to RuneSpeak (the Week 2 improvement, PRD-approved
 *        2026-09-28), for continued, replayable practice past this fixed
 *        five-question lesson. Opens in a new tab, so "Try again" is
 *        still here when the learner comes back. RUNESPEAK_URL below is
 *        the only thing to change if that address ever moves.
 *   [P2] XP reward for the lesson, and the running total kept on this
 *        device (xp.earned, xp.total).
 *   A review of every question: the Spanish word, the right answer, and
 *   the learner's pick when it was wrong (state.answers).
 *   Keyboard and screen reader users land on the heading, so the change
 *   of screen is announced instead of focus falling to the page body.
 *   Motion (confetti, XP count-up, staggered rows) is decoration only:
 *   the score and every answer are in the page from the first frame, the
 *   counting total's accessible name is its final value, and all of it
 *   is skipped under prefers-reduced-motion.
 */

const CONFETTI_PIECES = 26;
// Decorative palette, from tokens only (never --good/--bad: those mean something)
const CONFETTI_COLORS = ["--accent", "--xp", "--accent-deep", "--line-strong"];
const COUNT_UP_MS = 900;
// Week 2 improvement (PRD: docs.google.com/document/d/1zWRTaSH69uaIUsaz6pVFhnmsXQGaR7m3rruMeO9naYU).
// Separate app, separate repo (wiltobuild/RuneSpeak) — this is the only
// place this clone references it.
const RUNESPEAK_URL = "https://wiltobuild.github.io/RuneSpeak/";

export function renderCompletionScreen(state, container, { onRestart, xp }) {
  const total = state.questions.length;
  const tone = toneFor(state.score, total);

  container.innerHTML = `
    <section class="completion" aria-labelledby="completion-title">
      ${tone.confetti ? confetti() : ""}
      <div class="completion__trophy" aria-hidden="true">${tone.icon}</div>
      <h2 class="completion__title" id="completion-title" tabindex="-1">Lesson complete</h2>
      <p class="completion__message">${tone.message}</p>

      <div class="completion__score" data-role="score"></div>
      <p class="completion__caption">words answered correctly</p>

      ${xp ? xpSummary(xp) : ""}

      <h3 class="completion__review-title">Your answers</h3>
      <ol class="review-list">
        ${state.questions.map((question, i) => reviewItem(question, state.answers[i], i)).join("")}
      </ol>

      <button class="btn-primary" type="button" data-role="restart-btn">Try again</button>
      <a
        class="btn-secondary"
        href="${RUNESPEAK_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >Continue in RuneSpeak <span aria-hidden="true">↗</span><span class="visually-hidden">(opens in a new tab)</span></a>
    </section>
  `;

  container.querySelector("[data-role='score']").textContent = `${state.score} / ${total}`;
  container.querySelector("[data-role='restart-btn']").addEventListener("click", onRestart);

  if (xp) countUp(container.querySelector("[data-role='xp-total']"), xp.previous, xp.total);

  // The whole screen was just replaced; put focus somewhere meaningful.
  container.querySelector("#completion-title").focus();
}

/** Icon, message, and whether to celebrate — by how the lesson went. */
function toneFor(score, total) {
  if (score === total) return { icon: "🏆", message: "Perfect — every word right!", confetti: true };
  if (score >= Math.ceil(total / 2)) return { icon: "🎉", message: "Nice work — almost there.", confetti: true };
  return { icon: "🌱", message: "Good start. Try again to lock these words in.", confetti: false };
}

function xpSummary({ earned, total }) {
  return `
    <div class="completion__xp">
      <span class="xp-pill"><span aria-hidden="true">⚡</span> +${earned} XP</span>
      <span class="completion__xp-total">
        Total <strong data-role="xp-total">${total}</strong> XP
      </span>
    </div>
  `;
}

function reviewItem(question, answer, i) {
  const correct = Boolean(answer?.correct);
  const picked = answer ? question.choices[answer.choiceIndex] : null;
  return `
    <li class="review-item review-item--${correct ? "correct" : "wrong"}" style="--i: ${i}">
      <span class="review-item__mark" aria-hidden="true">${correct ? "✓" : "✕"}</span>
      <span class="review-item__text">
        <span class="review-item__word" lang="es">${escapeHtml(question.word)}</span>
        <span class="review-item__answer">${escapeHtml(question.correct)}</span>
        ${
          correct
            ? `<span class="visually-hidden">(correct)</span>`
            : `<span class="review-item__picked">You picked “${escapeHtml(picked ?? "nothing")}”</span>`
        }
      </span>
    </li>
  `;
}

/** A burst of confetti pieces, placed by index so every run looks the same. */
function confetti() {
  const pieces = Array.from({ length: CONFETTI_PIECES }, (_, i) => {
    const x = ((i * 37) % 100) - 50; // -50..49 % of the card, spread out
    const drift = ((i * 53) % 60) - 30; // sideways drift while falling
    const spin = ((i * 97) % 720) - 360;
    const delay = (i % 7) * 40;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    return `<span class="confetti__piece" style="--x:${x}%;--drift:${drift}px;--spin:${spin}deg;--delay:${delay}ms;--piece-color:var(${color})"></span>`;
  }).join("");
  return `<div class="confetti" aria-hidden="true">${pieces}</div>`;
}

/**
 * Count the total up from its previous value. The final number is
 * already in the page (and in the accessible name), so this is purely
 * visual; it is skipped entirely when the user prefers reduced motion.
 */
function countUp(el, from, to) {
  if (!el || from === to) return;
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  el.setAttribute("aria-label", String(to));
  let started = null;
  const step = (now) => {
    if (!el.isConnected) return; // the screen was replaced (e.g. Try again)
    started ??= now; // time from the first frame the learner can see
    const t = Math.min(1, (now - started) / COUNT_UP_MS);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  // The final number stays in place until the first frame actually runs:
  // background tabs pause animation frames, and a total stuck at its old
  // value would read as a bug.
  requestAnimationFrame(step);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
