"use client";

import { go } from "@/lib/scroll";

type Props = Omit<React.ComponentProps<"a">, "href"> & { href: string };

/** In-page anchor that glides (or fades through the veil on long jumps). */
export default function ScrollLink({ href, onClick, children, ...rest }: Props) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        go(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
