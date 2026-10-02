type Part = { text: string; kind: "g" | "it" };

/** A section's h2: bold capitals and a serif italic word, rising out of masks when scrolled into view. */
export default function SectionHead({
  id,
  index,
  parts,
  sup,
  side,
  lines = false,
  tight = false,
}: {
  id: string;
  index?: string;
  parts: Part[];
  sup?: string;
  side?: string;
  /** Put each part on its own line (the contact heading). */
  lines?: boolean;
  /** No space below (the photo strip sits right under its heading). */
  tight?: boolean;
}) {
  return (
    <div className="shead" style={tight ? { marginBottom: 0 } : undefined}>
      <div>
        {index ? <span className="mono idx">{index}</span> : null}
        <h2 id={id} className="sh2" data-reveal>
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 ? (lines ? <br /> : " ") : null}
              <span className="ln"><span className={`w ${p.kind}`}>{p.text}</span></span>
            </span>
          ))}
          {sup ? <sup>{sup}</sup> : null}
        </h2>
      </div>
      {side ? <span className="mono">{side}</span> : null}
    </div>
  );
}
