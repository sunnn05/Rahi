/**
 * Emergency numbers, in the order a bystander should think about them.
 *
 * 112 is first and always first: it is India's single ERSS number and reaches
 * police, fire and ambulance with one call, and the operator can dispatch to
 * your location. The others exist because people sometimes need a specific
 * service, not because they are alternatives to 112.
 *
 * 14567 is the elder helpline commonly cited for Good Samaritan harassment
 * support — verify the current number for your state before you demo this.
 */
export const CONTACTS = [
  {
    id: "112",
    number: "112",
    label: "Emergency",
    tone: "c-112",
    note: "Police, fire and ambulance. Call this first.",
  },
  {
    id: "108",
    number: "108",
    label: "Ambulance",
    tone: "c-highway",
    note: "Direct ambulance dispatch in most states.",
  },
  {
    id: "100",
    number: "100",
    label: "Police",
    tone: "c-police",
    note: "",
  },
  {
    id: "1033",
    number: "1033",
    label: "Highway Helpline",
    tone: "c-legal",
    note: "National highway emergencies and towing.",
  },
];
