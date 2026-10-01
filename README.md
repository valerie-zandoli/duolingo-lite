# Duolingo LITE

A five-question interactive Spanish practice lesson — choose an answer, check it, get instant feedback — built as a one-week team demo of a complete lesson engine.

**Team:** Wil (lead) · Valerie · Priscilla

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

**Week 2 improvement:** [RuneSpeak](https://github.com/wiltobuild/RuneSpeak), a replayable Spanish dungeon run built by Wil, linked from this lesson's completion screen. Play it at <https://wiltobuild.github.io/RuneSpeak/>.
