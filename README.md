# Duolingo LITE

A five-question interactive Spanish practice lesson — choose an answer, check it, get instant feedback — built as a one-week team demo of a complete lesson engine.

**Team:** Wil (lead) · Valerie · Priscilla

## About this fork

This is my fork of a one-week team build by Wil Sheppard (lead), Priscilla Batroni, and me.  The original is at [wiltobuild/duolingo-lite](https://github.com/wiltobuild/duolingo-lite), and I use it with Wil's permission under its MIT license.

**My part.**  I owned the question screen, the answer choice controls, the progress bar, and the responsive layout.  I built my part with an AI coding assistant.  My merged pull requests:

- **[#2](https://github.com/wiltobuild/duolingo-lite/pull/2):**  Built the question screen from the lesson state, fixed the progress animation, and added keyboard focus and screen-reader support.
- **[#4](https://github.com/wiltobuild/duolingo-lite/pull/4):**  Made the progress bar reach 5 of 5, fixed accessibility and contrast problems, and added a dependency-free test suite.
- **[#6](https://github.com/wiltobuild/duolingo-lite/pull/6):**  Linked the completion screen to RuneSpeak, as the project requirements document specified.
- **[#7](https://github.com/wiltobuild/duolingo-lite/pull/7):**  Moved the colors and rounded typography toward Duolingo's own look, after a team discussion about the project's rules.
- **[#8](https://github.com/wiltobuild/duolingo-lite/pull/8):**  Fixed a keyboard problem where pressing a number key left Enter unable to check the answer.
- **[#9](https://github.com/wiltobuild/duolingo-lite/pull/9):**  Added automated checks (CI), a license file, and share-link metadata.

## Quick start

```bash
npm run dev
```

Opens the app at `http://localhost:5173`. No build step, no
dependencies to install.

## Docs

- [DESIGN.md](DESIGN.md) — design tokens, components, and the visual
  reference this app is built to match
- [CONTRIBUTING.md](CONTRIBUTING.md) — file layout, ownership map,
  branching, and how to run things locally

## Status

Feature-complete for the one-week build: all P0 and P1 requirements,
plus the P2 XP reward and XP total kept on this device. A learner
answers five questions with instant feedback and a live progress bar,
then gets a completion screen that reviews every word, awards XP, and
adds it to their running total.

Live: <https://wiltobuild.github.io/duolingo-lite/> · Tests: see
[tests/README.md](tests/README.md) · Demo checklist:
[DEMO_TEST_CHECKLIST.md](DEMO_TEST_CHECKLIST.md) · Who owns what:
[CONTRIBUTING.md](CONTRIBUTING.md)
