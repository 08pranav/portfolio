import { Fragment } from "react";
import Clock from "./Clock";

/** Renders editor text, swapping each {time} for the live clock. */
export default function WithTime({ text }: { text: string }) {
  const parts = text.split("{time}");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <Clock /> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}
