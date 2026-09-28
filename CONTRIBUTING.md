# Contributing

Quick reference for working in this repo. See [DESIGN.md](DESIGN.md)
for the design system, and the PRD (linked in the team drive) for full
requirements and priorities.

## Running locally

No build step. Two options:

```bash
npm run dev
```

Opens the app at `http://localhost:5173` (uses `npx serve`, nothing to
install). Or just open `index.html` directly in a browser — **except**
`js/app.js` uses ES module imports, which most browsers block over a
plain `file://` URL, so `npm run dev` is the reliable option.

## File layout

```
index.html              entry point — loads fonts, css, js/app.js
css/
  tokens.css             design tokens (colors, type, spacing) — start here
  base.css                reset + global typography
  components.css          reusable component classes
js/
  app.js                  integration — wires state + UI together
  data/questions.js       shared lesson content
  state/lesson-state.js   the lesson state machine (pure functions, no DOM)
  state/xp-store.js       running XP total, saved in localStorage (no DOM)
  ui/
    question-screen.js    question + choices + progress bar
    feedback.js           correct/incorrect banner
    completion-screen.js  end-of-lesson screen
```

## Ownership (from the PRD)

| Area | Owner | Files |
|---|---|---|
| Lesson state, answer checking, XP, integration, release | **Wil** (lead) | `js/state/`, `js/app.js` |
| Question screen, choice controls, progress bar, responsive layout | **Valerie** | `js/ui/question-screen.js`, `css/components.css` (choice/progress classes) |
| Spanish content, feedback + completion screens, accessibility, demo test checklist | **Priscilla** | `js/data/questions.js`, `js/ui/feedback.js`, `js/ui/completion-screen.js` |

Each of us ships code/content that lands in the app, reviews a peer's
change before it merges, and demos our own piece. Wil pairs on
integration as needed.

**Working in your own file is intentional** — `js/app.js` never reaches
into another screen's internals, and UI modules never import each
other. If a change means editing someone else's file, ping them first.

## The shared question format

`js/data/questions.js` defines the shape every other module depends
on: `{ word, correct, choices[4], explanation? }`. Don't change this
shape without syncing with the team — `lesson-state.js` and both UI
screens assume it.

## Branches & commits

- Branch per feature: `feature/question-screen`, `feature/feedback-completion`, `feature/lesson-state`, etc.
- Commit messages: short imperative summary (`Add progress bar fill`, not `added stuff`).
- Open a PR into `main`; get one teammate's review before merging (see
  the ownership table above for who reviews what).

## Code style

Formatting is enforced by `.editorconfig` (2-space indent, LF line
endings, trailing newline) — most editors pick this up automatically.
No linter/formatter is configured yet; keep it consistent with the
surrounding file.

## Environment variables

Copy the shape of `.env` if you add any secrets/API keys — `.env`
itself is gitignored and never committed. If you add a variable, note
it in `.env` locally and mention it in your PR description so teammates
know to add it too.
