/**
 * Positioning images for the protocol cards.
 *
 * These are REAL first-aid diagrams you download and drop into
 * public/firstaid/ (see that folder's README.txt). Each entry points at a
 * file and carries the attribution its licence requires — the card shows a
 * small credit line beneath the image.
 *
 * Safety note: a positioning diagram is safety-critical. Only add an image
 * here that clearly and correctly shows the position its card describes. If a
 * downloaded image is ambiguous, leave its entry out — the card works fine
 * with just its verified text steps, and no picture is far better than a
 * misleading one for something like the recovery position.
 *
 * `src` is a path under /public, so it resolves at the site root. If a file
 * named here doesn't exist, the component simply shows no image (it checks by
 * attempting to load and hiding on error) — a missing download never breaks
 * the card.
 */

export const POSITION_IMAGES = {
  unconscious: {
    src: "/firstaid/recovery-position.png",
    alt: "Recovery position: person lying on their side, head tilted back, top leg bent to stay stable.",
    caption: "Recovery position — for someone unconscious but breathing normally.",
    // Fill in the real credit from whatever you download, e.g.:
    // credit: "Recovery position by Rama, Wikimedia Commons, CC BY-SA 3.0",
    credit: "",
  },

  // "keep-still" is used by the unconscious card too if you prefer a
  // do-not-move-the-neck image instead of/as well as recovery position.
  // Point unconscious.src at whichever you download and judge clearer.

  severeBleeding: {
    src: "/firstaid/bleeding-pressure.png",
    alt: "Applying firm direct pressure to a wound with a cloth.",
    caption: "Press firmly and steadily on the wound.",
    credit: "",
  },

  general: {
    src: "/firstaid/sitting-up.png",
    alt: "A conscious injured person sitting upright, supported and kept still.",
    caption: "Keep a conscious person still and comfortable.",
    credit: "",
  },

  // multipleVictims has no single position — no image, just its text steps.
};
