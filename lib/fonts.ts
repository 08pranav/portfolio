import localFont from "next/font/local";

/**
 * The same three typefaces as before (Archivo, Fraunces italic, Martian Mono), trimmed to what the site actually
 * uses: Basic Latin plus typographic punctuation, Archivo weights 400-800, Fraunces italic weights 300-400 (no
 * upright style, which is never used), Martian Mono at weight 400 in the two widths used. Measured against the
 * originals, no glyph moves by more than 0.14% of an em. Together they weigh 155 KB instead of 272 KB, which matters
 * because they download alongside the hero portrait.
 *
 * All three appear above the fold (masthead and nav, italic cover numerals and intro, mono labels), so all three are
 * preloaded. display: swap shows text at once in a metric-matched fallback, so nothing shifts when they arrive.
 */
export const archivo = localFont({
  src: [{ path: "./font-files/archivo.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const fraunces = localFont({
  src: [{ path: "./font-files/fraunces-italic.woff2", weight: "300 400", style: "italic" }],
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const martianMono = localFont({
  src: [{ path: "./font-files/martian-mono.woff2", weight: "400", style: "normal" }],
  variable: "--font-martian-mono",
  display: "swap",
  adjustFontFallback: false,
});

export const fontClassNames = `${archivo.variable} ${fraunces.variable} ${martianMono.variable}`;
