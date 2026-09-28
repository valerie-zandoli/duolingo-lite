# Design system

Source of truth for how Duolingo LITE looks. If you're adding UI, start
here instead of picking your own colors/fonts — it keeps all three
screens (question, feedback, completion) looking like one app.

Visual reference: the [PRD artifact](https://claude.ai/artifact/MSTFfQezWM5LutfGHvTfCR)
shows the target look end to end, including a working demo of the full
lesson loop. This scaffold's tokens and component classes are pulled
directly from it.

## Where things live

| File | What it defines |
|---|---|
| `css/tokens.css` | Colors, fonts, spacing scale, radius — every value everything else should reference |
| `css/base.css` | Reset + global typography |
| `css/components.css` | Reusable component classes (buttons, choices, progress bar, cards, banners) |

**Rule of thumb:** if you're about to write a hex code, a `px` spacing
value, or a font name directly in a UI module, stop — either an
existing token/class covers it, or it belongs in `tokens.css` /
`components.css` so the other screens can reuse it too.

## Color

| Token | Use |
|---|---|
| `--paper` | Page background |
| `--surface` / `--surface-2` | Card background / recessed surface (e.g. card header) |
| `--ink` / `--ink-soft` / `--ink-faint` | Primary / secondary / tertiary text |
| `--line` / `--line-strong` | Borders |
| `--control-border` | Border of an interactive control such as an answer choice: 3:1 against the card in both themes |
| `--accent` / `--accent-deep` / `--accent-wash` | Brand green — buttons, links, the Spanish word itself. Derived from Duolingo's own Feather Green (`--accent-brand`, `#58cc02`), darkened where needed to keep the app's own 3:1/4.5:1 contrast tests passing — see the comment at the top of `tokens.css` |
| `--good` / `--bad` | **Semantic only** — correct/incorrect answer feedback. Don't reuse these as decorative color; they mean something specific to the learner. |
| `--xp` | The XP reward pill on the completion screen (P2) |

All of the above are defined for light mode on `:root` and redefined
for dark mode (system preference, or an explicit `data-theme="dark"`
if the app ever adds a toggle). Never hardcode a color that only works
in one theme.

## Type

- **Display** (`--font-display`, Baloo 2) — headings, the Spanish word on
  the question screen, the completion score.
- **Body** (`--font-body`, Nunito) — everything else. Both are rounded,
  geometric Google Fonts chosen to evoke Duolingo's DIN Next Rounded
  without using that (licensed) font or Duolingo's own logo typeface —
  see `tokens.css`.
- **Mono** (`--font-mono`, Space Mono) — the progress count (`3/5`) and
  the completion score, anywhere digits line up.

## Components

Defined in `css/components.css`, documented inline with which owner's
screen uses them:

- `.app-shell`, `.card`, `.card__header`, `.card__body` — page/card layout
- `.progress-row`, `.progress-track`, `.progress-fill`, `.progress-count` — progress bar (Valerie)
- `.question-prompt`, `.question-word`, `.choice-list`, `.choice` (+ `--selected` / `--correct` / `--wrong` modifiers) — question screen (Valerie)
- `.choice__mark` — the symbol slot at the start of a choice (● selected, ✓ correct, ✕ wrong), so state never rests on color alone (Valerie)
- `.visually-hidden` — text for screen readers only, e.g. "(correct answer)" on a choice (shared utility)
- `.feedback-banner` (+ `--correct` / `--incorrect` modifiers) — feedback (Priscilla)
- `.btn-primary` — the Check / Continue / Try again button, shared
- `.lesson-header` (+ `__title`, `__xp`) — the card header: lesson name and running XP total (Wil, app.js)
- `.completion` (+ `__trophy`, `__title`, `__message`, `__score`, `__caption`, `__xp`, `__xp-total`, `__review-title`), `.xp-pill` — completion screen (Priscilla)
- `.review-list`, `.review-item` (+ `--correct` / `--wrong`, `__mark`, `__word`, `__answer`, `__picked`) — the per-question review on the completion screen (Priscilla)
- `.confetti`, `.confetti__piece` — the completion burst; decorative, hidden from screen readers and under reduced motion (Priscilla)

## Responsive & accessibility

- Design at ~360px width first (phone), then verify desktop — `.app-shell`
  caps width at 480px so it never needs separate mobile/desktop layouts.
- Every interactive element needs a visible focus state — this is
  already handled globally in `base.css` (`:focus-visible`), don't
  override it away.
- Respect `prefers-reduced-motion` (already handled globally) if you add
  any new animation. Anything that *starts* hidden and animates in must
  still be readable with animations off (the confetti rests invisible and
  is `display: none` under reduced motion; the review rows rest visible).
  JavaScript-driven motion, like the XP count-up, has to check the media
  query itself — base.css only stops CSS animations.
