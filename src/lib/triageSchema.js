/**
 * Triage classification schema + validator.
 *
 * This file defines the ONLY shape of data the AI model is allowed to return,
 * and the gate that enforces it. The model's entire job is to listen to a
 * panicked description and fill in these few fields — it never writes advice,
 * never returns free text a user will see, never picks which protocol to show.
 * src/data/protocols.js turns this classification into instructions; the model
 * has no say in that step.
 *
 * Why validation is strict and paranoid here: this is the boundary between
 * an unpredictable language model and a safety-critical UI. If the model
 * returns something malformed, hallucinated, or shaped wrong, we must catch
 * it and fall back to safe defaults — never pass junk downstream. A wrong
 * "everything is fine" is far more dangerous than an honest "unknown", so
 * the failure mode of every field is "unknown", which surfaces the general
 * care card rather than silently suppressing an urgent one.
 */

/**
 * The three-state answer used for consciousness and bleeding.
 * "unknown" is a first-class value, not an error — a bystander shouting over
 * traffic often genuinely cannot say, and the app must represent that
 * honestly rather than guessing yes or no.
 */
export const TRISTATE = Object.freeze({
  YES: "yes",
  NO: "no",
  UNKNOWN: "unknown",
});

/**
 * The exact object the model must return. Documented here as the contract;
 * the model is told this shape in its prompt (src/lib/triage.js) and the
 * validator below rejects anything that doesn't match.
 *
 * {
 *   victims:        integer >= 1, or null if unknown
 *   conscious:      "yes" | "no" | "unknown"
 *   severeBleeding: "yes" | "no" | "unknown"
 *   confidence:     "high" | "medium" | "low"
 * }
 *
 * Note what is NOT here: no "advice", no "instructions", no "message", no
 * free-text field of any kind. If a future version is tempted to add one,
 * that's the moment to stop — advice comes from vetted protocol cards, full
 * stop.
 */

const VALID_TRISTATE = new Set([TRISTATE.YES, TRISTATE.NO, TRISTATE.UNKNOWN]);
const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);

/**
 * The safe default. Every field set to its most cautious value: victims
 * unknown, consciousness unknown, bleeding unknown. selectProtocols() turns
 * this into the general-care card — real, safe guidance — rather than nothing.
 * This is what we return whenever the model output can't be trusted.
 */
export const SAFE_DEFAULT = Object.freeze({
  victims: null,
  conscious: TRISTATE.UNKNOWN,
  severeBleeding: TRISTATE.UNKNOWN,
  confidence: "low",
  _fallback: true, // marks that this came from a failure, so the UI can note it
});

/**
 * Validates and normalizes raw model output into a trusted classification.
 * Never throws — on any problem it returns SAFE_DEFAULT. The caller can check
 * the `_fallback` flag to tell the user the automatic reading didn't work and
 * they should rely on the general guidance (and the operator on 112).
 *
 * @param {unknown} raw - parsed JSON from the model, of unknown shape
 * @returns {{victims: number|null, conscious: string, severeBleeding: string, confidence: string, _fallback?: boolean}}
 */
export function validateClassification(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return SAFE_DEFAULT;
  }

  // victims: accept a positive integer, or null/absent -> null (unknown).
  // Reject zero, negatives, non-numbers, absurd values.
  let victims = null;
  if (raw.victims != null) {
    const n = Number(raw.victims);
    if (Number.isInteger(n) && n >= 1 && n <= 100) {
      victims = n;
    }
    // anything else falls through to null — "unknown count", not a crash
  }

  // conscious / severeBleeding: must be one of the three known strings.
  // Anything unexpected becomes "unknown" — the safe direction.
  const conscious = VALID_TRISTATE.has(raw.conscious)
    ? raw.conscious
    : TRISTATE.UNKNOWN;

  const severeBleeding = VALID_TRISTATE.has(raw.severeBleeding)
    ? raw.severeBleeding
    : TRISTATE.UNKNOWN;

  // confidence is advisory only (used to decide whether to nudge the user to
  // recheck) — default to "low" if missing or odd.
  const confidence = VALID_CONFIDENCE.has(raw.confidence)
    ? raw.confidence
    : "low";

  return { victims, conscious, severeBleeding, confidence };
}

/**
 * Bridges the tristate schema to the boolean-ish shape selectProtocols()
 * expects. "unknown" maps to null so the protocol selector treats it as
 * "not established" rather than false — an unknown must never be read as
 * "no bleeding" or "conscious".
 */
export function toProtocolInput(classification) {
  const triToBool = (v) =>
    v === TRISTATE.YES ? true : v === TRISTATE.NO ? false : null;

  return {
    victims: classification.victims,
    conscious: triToBool(classification.conscious),
    severeBleeding: triToBool(classification.severeBleeding),
  };
}
