/**
 * Languages the app intends to support.
 *
 * Only English has strings today. The selector is wired and the choice
 * persists, but the translated strings arrive in week 4 with the Bhashini
 * integration — the UI says so plainly rather than pretending otherwise.
 *
 * Legal text is deliberately excluded from machine translation. A mistranslated
 * statement of someone's rights at a crash scene is worse than no translation,
 * so those strings need review by someone qualified before they ship.
 */
export const LANGUAGES = [
  { code: "hi", label: "हिंदी", ready: false },
  { code: "en", label: "English", ready: true },
  { code: "ta", label: "தமிழ்", ready: false },
  { code: "te", label: "తెలుగు", ready: false },
  { code: "kn", label: "ಕನ್ನಡ", ready: false },
  { code: "mr", label: "मराठी", ready: false },
  { code: "bn", label: "বাংলা", ready: false },
];
