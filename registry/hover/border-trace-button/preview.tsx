"use client";

import { BorderTraceButton } from "./border-trace-button";

export default function Preview() {
  return (
    <BorderTraceButton
      traceColor="#2E2BE8"
      className="rounded-full border border-[#14150F]/15 bg-transparent px-6 py-3 text-sm font-medium text-[#14150F]"
    >
      Turn it on
    </BorderTraceButton>
  );
}
