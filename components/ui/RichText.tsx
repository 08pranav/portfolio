import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { RichText as RichTextValue } from "@/sanity/lib/types";

const components: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: { em: ({ children }) => <span className="it">{children}</span> },
};

/** One paragraph of editor text; italic marks become the serif accent. No wrapper element. */
export default function RichText({ value }: { value: RichTextValue }) {
  return <PortableText value={value} components={components} />;
}
