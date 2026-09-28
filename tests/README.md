# Tests

No dependencies to install. Two ways to run them.

## Logic tests (Node)

Covers the lesson state machine and the lesson content. Needs Node 22.7 or newer.

```bash
node --test "tests/*.test.js"
```

- `lesson-state.test.js` — the PRD's state rules: change selection before checking, no double scoring, advance only after checking, restart, plus the recorded answers the completion screen reviews and the lesson XP formula.
- `xp-store.test.js` — the running XP total: saved and reloaded, never negative, ignores tampered values, keeps counting in memory when storage is blocked.
- `questions.test.js` — the content: five questions, four choices each, exactly one correct answer, matches the PRD appendix.

## Browser tests

Covers the screens, the real app, layout, accessibility, and color contrast.

```bash
npm run dev
```

Then open <http://localhost:5173/tests/>. The page shows a pass, fail, or known-gap line per test and a summary at the top. The results are also on `window.__testResults`.

| File | What it covers |
|---|---|
| `suite-component.js` | The question screen rendered directly: progress bar, choice and Check states, click handlers, HTML escaping, keyboard focus |
| `suite-e2e.js` | The real app clicked through: golden path, refresh, tampering, double submits, feedback speed, a seeded random walk |
| `suite-layout.js` | 320px to 1280px: no sideways scroll, 44px touch targets, clipped text |
| `suite-semantics.js` | Language tag, group name, non-color state symbols, screen reader text |
| `suite-contrast.js` | WCAG contrast in the light and dark theme |
| `suite-completion.js` | The completion screen: the per-question review, XP awarded once and accumulated across lessons and refreshes, focus on the heading, confetti only for a good lesson, the 1–4 answer keys |

A **known gap** (`todo`) runs and reports but does not fail the run. It records a real issue that the team has not fixed yet. When a known gap starts passing, the page says so: turn it into a normal test.

The tests finish real lessons, which awards XP in this browser. The runner saves your XP total before the run and puts it back afterwards, so running the tests never changes it.

To add a suite, create `tests/suite-<name>.js`, register tests with `test(...)` from `harness.js`, and import the file in `browser-tests.js`.

No known gaps are open right now.
