/**
 * Always-visible shortcut to 112.
 *
 * A plain tel: anchor rather than a button with a handler, so it still works
 * if the JS bundle fails to hydrate. There is no state in this app where
 * calling emergency services is more than one tap away.
 */
export default function SosButton() {
  return (
    <a className="sos" href="tel:112" aria-label="Call 112 emergency services">
      SOS
    </a>
  );
}
