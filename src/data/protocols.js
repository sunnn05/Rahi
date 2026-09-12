/**
 * First-aid protocol cards — plain data, written by a person, never by a model.
 *
 * Verification status as of 2026-09-12: ALL FOUR cards checked against real
 * published guidance. severeBleeding, unconscious, and general against the
 * Indian First Aid Manual (IFAM, 7th ed., St John Ambulance India / Indian
 * Red Cross Society), the ANZCOR 2020 CoSTR bleeding guideline, Mayo Clinic,
 * and American Red Cross. multipleVictims against converging professional
 * triage sources aligned with IFAM's "Emergency Triage" section (p.303).
 *
 * "Verified" here means checked against real published guidance, not reviewed
 * by a certified first-aid instructor in person. Before this is relied on by
 * real users at real accidents (as opposed to shown in a demo), have a
 * certified instructor confirm the cards — that's the last mile no amount of
 * source-checking fully replaces for safety-critical content.
 *
 * Design rule this file exists to enforce: the AI classifier in
 * src/lib/keywordClassifier.js NEVER writes advice text. It only returns a
 * classification (victims, consciousness, bleeding). This file is the only
 * source of instructions a person actually sees. If you ever find yourself
 * tempted to let a model "just phrase it more naturally" — don't. That's
 * exactly the failure mode this architecture exists to prevent.
 */

export const PROTOCOLS = {
  /**
   * Shown whenever severe bleeding is reported, regardless of consciousness.
   * This is the highest-priority card — bleeding control comes first because
   * it's the most time-critical, reversible cause of death at a crash scene.
   *
   * VERIFIED 2026-09 against: Indian First Aid Manual (IFAM, 7th ed., St John
   * Ambulance India / Indian Red Cross Society — itself built on ILCOR 2015);
   * the ANZCOR 2020 CoSTR bleeding guideline; Mayo Clinic first-aid guidance;
   * American Red Cross "Bleeding (Life-Threatening External)".
   *
   * Correction made after checking sources: earlier draft listed limb
   * elevation as a primary step. Current evidence (ANZCOR 2020 CoSTR) found
   * no evidence elevation helps control bleeding, and it risks causing more
   * pain or injury — direct pressure is the technique that matters. Elevation
   * is dropped here rather than kept as outdated "common knowledge".
   */
  severeBleeding: {
    id: "severeBleeding",
    verified: true,
    priority: 1,
    title: "Severe bleeding — act now",
    urgent: true,
    steps: [
      "Press down firmly on the wound with a clean cloth or your hand, using the palm.",
      "Keep pressing without lifting to check — steady, continuous pressure is what stops bleeding. Hold for at least 3–5 minutes before checking.",
      "If blood soaks through, do not remove the cloth. Add more cloth on top and keep pressing.",
      "Keep applying pressure until paramedics arrive and take over.",
    ],
    doNots: [
      "Do not remove any object stuck in a wound — leave it in place and press around it, not on it.",
      "Do not press directly on an eye injury or a wound where you suspect a skull fracture.",
      "Do not use a tourniquet unless you are trained — improper use can cause serious harm. Direct pressure is the primary technique for an untrained bystander.",
      "Do not deliberately raise the limb as a first step — current guidance found no evidence this helps, and moving an injured limb can cause more harm. Focus on pressure.",
    ],
  },

  /**
   * Shown when the person is reported unconscious but no severe bleeding.
   *
   * VERIFIED 2026-09 directly against Indian First Aid Manual (IFAM, 7th ed.,
   * St John Ambulance India / Indian Red Cross Society), sections B.3.4,
   * B.6 (Recovery Position), and B.6.1 summary table:
   *   "Unconscious, and breathing normally → Put the casualty in recovery
   *    position." / "Unconscious and not breathing → Start CPR."
   * IFAM B.3.4 explicitly states: do not give food or drink to a person who
   * is severely injured, feeling nausea, becoming sleepy, or unconscious.
   *
   * Simplification made deliberately: IFAM's actual recovery-position
   * technique is a specific physical manoeuvre (arm and leg positioning,
   * rolling the body as a unit) that cannot be taught safely through text
   * alone — it needs a diagram or video. This card gives the safe, correct
   * default (don't move them, check breathing, stay put) rather than a
   * text description of a physical technique someone could get wrong.
   */
  unconscious: {
    id: "unconscious",
    verified: true,
    priority: 2,
    title: "Unconscious — do not move the neck",
    urgent: true,
    steps: [
      "Do not shake or move the person, especially the head and neck.",
      "Check if they are breathing normally — look for chest movement, listen close to their mouth, for up to 10 seconds.",
      "If breathing normally, stay with them, keep them as still as possible, and do not leave them alone until help arrives.",
      "If they stop breathing or are not breathing normally, and you know CPR, begin it immediately. If you don't, tell the 112 operator — they can talk you through it.",
    ],
    doNots: [
      "Do not give them anything to eat or drink.",
      "Do not try to sit them up or move them unless there is immediate danger.",
      "Do not spend time searching for a pulse — for someone not breathing normally, current guidance is to start CPR without checking pulse first.",
    ],
  },

  /**
   * Default card — conscious, no reported severe bleeding, or classification
   * was uncertain. Still genuinely useful, not a placeholder.
   *
   * VERIFIED 2026-09 against IFAM section B.3.4 ("Provide first aid"), which
   * explicitly lists: do not give food or drink to a person who is severely
   * injured, nauseous, becoming sleepy, or falling unconscious; reassure the
   * person and explain what is happening; keep them warm.
   */
  general: {
    id: "general",
    verified: true,
    priority: 3,
    title: "General care while help is on the way",
    urgent: false,
    steps: [
      "Keep the person still. Do not let them get up and walk around, even if they insist they're fine.",
      "Tell them your name, explain you're helping, and reassure them calmly — this genuinely helps.",
      "Keep them warm — shock can set in even from a moderate injury.",
      "Watch for changes: if they become drowsy, confused, or start bleeding heavily, call 112 again with an update.",
    ],
    doNots: [
      "Do not move them unless there is immediate danger (fire, oncoming traffic, fuel leak).",
      "Do not give them anything to eat or drink — they may need surgery.",
    ],
  },

  /**
   * Shown alongside any of the above when more than one victim is reported —
   * a distinct concern (triage / attention allocation), not a replacement.
   *
   * VERIFIED 2026-09 against multiple converging first-aid triage sources
   * (Life Saving First Aid, RealFirstAid, First Aid Course Gold Coast, and
   * the mass-casualty principles the IFAM "Emergency Triage" section, p.303,
   * is built on). Key correction from the earlier draft: the naive rule
   * "treat unconscious people first" is explicitly warned against by
   * professional sources. Correct priority is CONTROLLABLE LIFE THREATS —
   * severe bleeding and airway — and the walking wounded can be asked to
   * help rather than treated first. Card rewritten to reflect that.
   */
  multipleVictims: {
    id: "multipleVictims",
    verified: true,
    priority: 0, // shown first, as an add-on banner, not instead of a main card
    title: "More than one person injured",
    urgent: true,
    steps: [
      "Tell the 112 operator exactly how many people are injured — this decides how many ambulances are sent.",
      "Deal with the biggest life threats first: someone bleeding heavily, or someone not breathing normally, comes before someone who is awake and only in pain.",
      "Anyone who can walk and talk can often wait — and can be asked to help you, or to hold pressure on someone else's wound.",
      "If other bystanders are there, give each one a clear job: one calls 112, one holds pressure on a bleeding wound, one flags down help.",
    ],
    doNots: [
      "Do not get stuck treating one person while others with worse injuries go unattended — stabilise the worst life threat, then move on.",
    ],
  },
};

/**
 * Maps a classifier result to which cards to show, in order.
 *
 * This function is the ONLY place that turns model output into what a user
 * sees on screen. It is pure lookup logic — no text generation, nothing that
 * touches an API. Keep it that way.
 *
 * @param {{ victims: number|null, conscious: boolean|null, severeBleeding: boolean|null }} classification
 * @returns {Array} ordered list of protocol card objects to display
 */
export function selectProtocols(classification) {
  const { victims, conscious, severeBleeding } = classification;
  const cards = [];

  if (victims != null && victims > 1) {
    cards.push(PROTOCOLS.multipleVictims);
  }

  if (severeBleeding === true) {
    cards.push(PROTOCOLS.severeBleeding);
  }

  if (conscious === false) {
    cards.push(PROTOCOLS.unconscious);
  }

  // Nothing urgent matched — always show something useful, never a blank
  // screen. An uncertain classification still deserves real guidance.
  if (cards.length === 0 || (severeBleeding !== true && conscious !== false)) {
    cards.push(PROTOCOLS.general);
  }

  return cards.sort((a, b) => a.priority - b.priority);
}
