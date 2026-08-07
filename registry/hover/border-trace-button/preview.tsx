"use client";

import { BorderTraceButton } from "./border-trace-button";

export default function Preview() {
  return (
    <BorderTraceButton
      traceColor="#2E2BE8"
      // No `border` here on purpose: the component draws the edge itself. A border on the
      // button would push every effect layer 1px inside it, so the traced ring would never
      // reach the button's own edge — see the ring comment in the component.
      className="rounded-full bg-transparent px-6 py-3 text-sm font-medium text-[#14150F]"
    >
      Turn it on
    </BorderTraceButton>
  );
}
