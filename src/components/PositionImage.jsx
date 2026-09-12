import { useState } from "react";

/**
 * Shows a positioning diagram for a protocol card, IF the image file exists.
 *
 * Renders nothing until the image successfully loads, and if the file is
 * missing or fails to load, stays hidden — so a not-yet-downloaded image never
 * leaves a broken-image icon on a card. The card degrades to text-only, which
 * is always safe.
 */
export default function PositionImage({ image }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!image || failed) return null;

  return (
    <figure className="pos-fig" style={{ display: loaded ? "block" : "none" }}>
      <img
        src={image.src}
        alt={image.alt}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      {image.caption && <figcaption className="pos-cap">{image.caption}</figcaption>}
      {image.credit && <figcaption className="pos-credit">{image.credit}</figcaption>}
    </figure>
  );
}
