/**
 * Tests for the XP store (js/state/xp-store.js): the running XP total
 * kept on this device (PRD [P2] "earned XP retained locally").
 *
 *   node --test "tests/*.test.js"
 */

import test from "node:test";
import assert from "node:assert/strict";

import { createXpStore, STORAGE_KEY } from "../js/state/xp-store.js";

/** A minimal in-memory stand-in for window.localStorage. */
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

/** Storage that throws on every call, like a blocked or private window. */
const brokenStorage = {
  getItem() {
    throw new Error("SecurityError");
  },
  setItem() {
    throw new Error("QuotaExceededError");
  },
};

test("starts at zero when nothing is stored", () => {
  assert.equal(createXpStore(fakeStorage()).total(), 0);
});

test("adding XP returns the total before and after, and saves it", () => {
  const storage = fakeStorage();
  const store = createXpStore(storage);
  assert.deepEqual(store.add(16), { previous: 0, total: 16 });
  assert.deepEqual(store.add(10), { previous: 16, total: 26 });
  assert.equal(storage.data[STORAGE_KEY], "26");
});

test("[P2] the total survives a reload: a new store reads what the last one saved", () => {
  const storage = fakeStorage();
  createXpStore(storage).add(20);
  assert.equal(createXpStore(storage).total(), 20);
});

test("ignores a corrupted or tampered stored value", () => {
  for (const bad of ["abc", "-5", "", "NaN"]) {
    const store = createXpStore(fakeStorage({ [STORAGE_KEY]: bad }));
    assert.equal(store.total(), 0, `stored "${bad}" reads as 0`);
  }
});

test("never adds negative or fractional XP", () => {
  const store = createXpStore(fakeStorage());
  assert.equal(store.add(-50).total, 0);
  assert.equal(store.add(3.9).total, 3);
});

test("keeps counting in memory when storage throws", () => {
  const store = createXpStore(brokenStorage);
  assert.equal(store.total(), 0);
  assert.equal(store.add(12).total, 12);
  assert.equal(store.add(8).total, 20);
  assert.equal(store.total(), 20);
});
