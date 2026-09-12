/**
 * Keyword-based triage classifier — the free, no-API-key, no-cost stand-in
 * for an LLM classifier.
 *
 * It reads a plain-text description (typed, or transcribed from voice by the
 * Web Speech API) and fills in the SAME schema an LLM would return
 * (src/lib/triageSchema.js): victims, conscious, severeBleeding, confidence.
 * Everything downstream — validation, protocol selection, the UI — is
 * identical whether this or a paid model produced the classification. If you
 * ever get API credits, you replace THIS ONE FUNCTION and nothing else changes.
 *
 * Design stance: this classifier is deliberately dumb and deliberately
 * cautious. It cannot understand phrasing it wasn't given keywords for, so
 * its job is not to be clever — it's to be honest about what it's sure of and
 * return "unknown" for everything else. Because the protocol layer treats
 * "unknown" as "not established" and falls back to safe general-care guidance,
 * a miss here produces cautious advice, never wrong-but-confident advice.
 *
 * What this is NOT: it is not a medical judgement, and it never writes advice.
 * It only spots words. The instructions a user sees always come from the
 * human-verified cards in src/data/protocols.js.
 */

import { TRISTATE } from "./triageSchema.js";

/**
 * Each signal is a set of phrases. We match on word/phrase presence, lowercased.
 * Negation phrases are checked FIRST and win — "not bleeding" must never be
 * read as bleeding. This is crude but the direction of every failure is safe:
 * a missed positive falls through to "unknown" (→ general care), and an
 * explicit negative is respected.
 *
 * These lists are English-only for now. When voice input runs through the Web
 * Speech API in other languages, the transcript will be in that language and
 * these keywords won't match — the classifier will correctly return "unknown"
 * rather than guess, which is the safe behaviour. Extending to Hindi/Kannada
 * keywords is a clean future step, not a correctness risk today.
 */

const BLEEDING_POSITIVE = [
  "bleeding", "blood", "bleed", "haemorrhage", "hemorrhage", "cut open",
  "gushing", "lot of blood", "losing blood", "wound",
];
const BLEEDING_NEGATIVE = [
  "no blood", "not bleeding", "no bleeding", "isn't bleeding", "not much blood",
  "no visible blood", "stopped bleeding",
];

const UNCONSCIOUS_POSITIVE = [
  "unconscious", "not awake", "won't wake", "wont wake", "not waking",
  "passed out", "not responding", "unresponsive", "knocked out",
  "not moving", "collapsed", "fainted", "blacked out", "not conscious",
];
const CONSCIOUS_POSITIVE = [
  "awake", "conscious", "talking", "responding", "alert", "can speak",
  "is speaking", "responsive", "walking", "sitting up",
];

/**
 * Extracts a victim count from phrases like "two people", "3 injured",
 * "one person", "a couple of people". Returns null if nothing clear is found.
 * Deliberately conservative: it would rather say "unknown count" than guess.
 */
function extractVictims(text) {
  // Direct digit: "3 people", "2 injured"
  const digit = text.match(/\b(\d{1,3})\s+(?:people|persons?|injured|victims?|hurt|casualties)\b/);
  if (digit) {
    const n = parseInt(digit[1], 10);
    if (n >= 1 && n <= 100) return n;
  }

  // Word numbers up to a few — beyond "several" the exact count stops mattering
  // for the triage banner (which only cares about >1).
  const words = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    a: 1, an: 1, single: 1,
  };
  const wordMatch = text.match(/\b(one|two|three|four|five|six|single)\s+(?:people|person|persons|injured|victims?|hurt|guy|man|woman|child|kid)\b/);
  if (wordMatch && words[wordMatch[1]] != null) {
    return words[wordMatch[1]];
  }

  // Vague plurals that clearly mean "more than one" but not an exact number.
  // We report 2 as "the smallest number that still means multiple", which is
  // all the multipleVictims banner needs. Not a precise count, and not
  // pretended to be.
  if (/\b(several|multiple|many|lots of|bunch of|a couple|couple of|group of)\s+(?:people|persons?|injured|victims?|hurt)\b/.test(text)) {
    return 2;
  }

  return null;
}

function containsAny(text, phrases) {
  return phrases.some((p) => text.includes(p));
}

/**
 * Classifies a free-text description into the triage schema.
 *
 * @param {string} description - typed or transcribed text
 * @returns {{victims: number|null, conscious: string, severeBleeding: string, confidence: string}}
 *          Same shape validateClassification() expects. Always safe-by-default.
 */
export function classifyByKeywords(description) {
  if (typeof description !== "string" || description.trim() === "") {
    return {
      victims: null,
      conscious: TRISTATE.UNKNOWN,
      severeBleeding: TRISTATE.UNKNOWN,
      confidence: "low",
    };
  }

  const text = description.toLowerCase();

  // --- bleeding: negation wins, then positive, else unknown ---
  let severeBleeding = TRISTATE.UNKNOWN;
  if (containsAny(text, BLEEDING_NEGATIVE)) {
    severeBleeding = TRISTATE.NO;
  } else if (containsAny(text, BLEEDING_POSITIVE)) {
    severeBleeding = TRISTATE.YES;
  }

  // --- consciousness: unconscious cues win over conscious cues, because the
  // safer error is to treat an ambiguous case as needing the unconscious
  // protocol. If both appear (e.g. "was talking, now not responding"), we
  // take the more urgent reading. ---
  let conscious = TRISTATE.UNKNOWN;
  const saysUnconscious = containsAny(text, UNCONSCIOUS_POSITIVE);
  const saysConscious = containsAny(text, CONSCIOUS_POSITIVE);
  if (saysUnconscious) {
    conscious = TRISTATE.NO;
  } else if (saysConscious) {
    conscious = TRISTATE.YES;
  }

  const victims = extractVictims(text);

  // Confidence is advisory only. We call it "low" whenever anything important
  // stayed unknown, so the UI can nudge the user to rely on the 112 operator.
  const anyUnknown =
    conscious === TRISTATE.UNKNOWN || severeBleeding === TRISTATE.UNKNOWN;
  const confidence = anyUnknown ? "low" : "medium";
  // Never "high": a keyword matcher hasn't earned that, and overstating
  // confidence in a medical context is exactly the wrong way to be wrong.

  return { victims, conscious, severeBleeding, confidence };
}
