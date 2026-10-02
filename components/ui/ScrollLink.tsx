"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { go } from "@/lib/scroll";

type Props = Omit<React.ComponentProps<"a">, "href"> & { href: string };

/**
 * In-page anchor. On the home page it glides to the section (or fades through the veil on long jumps). On any other
 * page (a project, the 404) the same link goes to the home page at that section.
 */
export default function ScrollLink({ href, onClick, children, ...rest }: Props) {
  const onHome = usePathname() === "/";
  if (!onHome) {
    return (
      <Link href={`/${href}`} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }
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
