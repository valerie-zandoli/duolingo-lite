/**
 * Browser test runner. Serve the repo (npm run dev) and open
 * http://localhost:5173/tests/ — see index.html.
 *
 * Add a suite by importing its file below; each suite registers its tests
 * with the harness when imported.
 */

import { run } from "./harness.js";
import { STORAGE_KEY as XP_KEY } from "../js/state/xp-store.js";

import "./suite-component.js";
import "./suite-e2e.js";
import "./suite-layout.js";
import "./suite-semantics.js";
import "./suite-contrast.js";
import "./suite-completion.js";

// The app runs in same-origin iframes and awards XP for every lesson a
// test finishes. Put the tester's own XP total back afterwards, so running
// the tests never inflates it.
const savedXp = localStorage.getItem(XP_KEY);
try {
  await run();
} finally {
  if (savedXp === null) localStorage.removeItem(XP_KEY);
  else localStorage.setItem(XP_KEY, savedXp);
}
