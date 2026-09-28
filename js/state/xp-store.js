/**
 * Total XP, kept across lessons on this device.
 * Owner: Wil (lead).
 *
 * [P2] "User can see earned XP retained locally." Stored in
 * localStorage, so it survives a refresh on the same browser and device
 * and never leaves it. Storage can be missing or throw (private
 * windows, blocked site data), so every read and write is guarded and
 * falls back to an in-memory total for the rest of the visit.
 *
 * Like lesson-state.js, this never touches the DOM. app.js reads and
 * writes the total and passes the numbers to the UI modules.
 */

export const STORAGE_KEY = "duolingo-lite:total-xp";

/**
 * Create a store over any Storage-like object ({ getItem, setItem }).
 * Tests pass a fake; the app passes nothing and gets the browser's
 * localStorage, looked up lazily because even reading
 * `window.localStorage` throws when site data is blocked.
 */
export function createXpStore(customStorage) {
  let memoryTotal = 0;
  const storage = {
    getItem: (key) => (customStorage ?? globalThis.localStorage)?.getItem(key),
    setItem: (key, value) => (customStorage ?? globalThis.localStorage)?.setItem(key, value),
  };

  function read() {
    try {
      const value = Number.parseInt(storage.getItem(STORAGE_KEY) ?? "", 10);
      if (Number.isInteger(value) && value >= 0) memoryTotal = value;
    } catch {
      // Storage unavailable: keep the in-memory total.
    }
    return memoryTotal;
  }

  function write(total) {
    memoryTotal = total;
    try {
      storage.setItem(STORAGE_KEY, String(total));
    } catch {
      // Storage unavailable or full: the in-memory total still counts.
    }
  }

  return {
    /** The total XP earned so far on this device. */
    total: read,

    /** Add XP for a finished lesson. Returns the total before and after. */
    add(amount) {
      const previous = read();
      const total = previous + Math.max(0, Math.floor(amount));
      write(total);
      return { previous, total };
    },
  };
}
