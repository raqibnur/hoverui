"use client";

import { LiquidFillButton } from "./liquid-fill-button";

export default function Preview() {
  return (
    <LiquidFillButton
      fillColor="var(--ink)"
      fillTextColor="var(--paper)"
      className="rounded-full border border-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--ink)]"
    >
      Get started
    </LiquidFillButton>
  );
}
