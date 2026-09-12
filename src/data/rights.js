/**
 * Legal content lives here as plain data, never generated at runtime.
 *
 * Rule for this file: every line must be traceable to a statute, rule or
 * judgment. If you cannot cite it, it does not go in the app. Verify each
 * entry against the current MoRTH text before you demo.
 *
 * Sources to check:
 *  - Motor Vehicles Act 1988, s.134A (Good Samaritan protection)
 *  - Motor Vehicles Act 1988, s.162 (cashless treatment)
 *  - MoRTH Good Samaritan guidelines / Supreme Court directions (2016)
 */

export const RIGHTS = [
  {
    id: "no-liability",
    text: "A Good Samaritan is not liable for any civil or criminal action for any injury or death of a victim caused while giving help in good faith.",
    source: "Motor Vehicles Act 1988, s.134A",
  },
  {
    id: "no-details",
    text: "You may leave immediately after handing the victim over. Police and hospital staff cannot force you to give your name or address.",
    source: "MoRTH Good Samaritan guidelines",
  },
  {
    id: "no-payment",
    text: "You are not responsible for the victim's treatment costs. Hospitals cannot ask you to pay or to deposit money.",
    source: "MoRTH Good Samaritan guidelines",
  },
  {
    id: "cashless",
    text: "The victim is entitled to cashless treatment up to Rs 1.5 lakh for 7 days at a designated hospital under the PM RAHAT scheme.",
    source: "Motor Vehicles Act 1988, s.162",
  },
];

// Shown on the card. Deliberately worded as information, not as proof.
export const CARD_NOTICE =
  "This card records where and when help was given. It is a summary of existing rights, not a legal document.";
