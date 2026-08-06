import type { ComponentType } from "react";

import LiquidFillButtonPreview from "@/registry/hover/liquid-fill-button/preview";
import MagneticButtonPreview from "@/registry/hover/magnetic-button/preview";
import BorderTraceButtonPreview from "@/registry/hover/border-trace-button/preview";
import ScrambleButtonPreview from "@/registry/hover/scramble-button/preview";
import SpotlightCardPreview from "@/registry/hover/spotlight-card/preview";
import TiltCardPreview from "@/registry/hover/tilt-card/preview";
import RevealCardPreview from "@/registry/hover/reveal-card/preview";
import ChaseBorderCardPreview from "@/registry/hover/chase-border-card/preview";
import StaggerTextPreview from "@/registry/hover/stagger-text/preview";
import DrawUnderlinePreview from "@/registry/hover/draw-underline/preview";
import BlurSwapLinkPreview from "@/registry/hover/blur-swap-link/preview";
import SlideMarqueeLinkPreview from "@/registry/hover/slide-marquee-link/preview";

/**
 * slug -> preview component. Add one line per effect.
 * Imported statically so previews are in the initial bundle; the gallery is the product,
 * so it must not wait on a lazy chunk before the first effect is hoverable.
 */
export const previews: Record<string, ComponentType> = {
  "liquid-fill-button": LiquidFillButtonPreview,
  "magnetic-button": MagneticButtonPreview,
  "border-trace-button": BorderTraceButtonPreview,
  "scramble-button": ScrambleButtonPreview,
  "spotlight-card": SpotlightCardPreview,
  "tilt-card": TiltCardPreview,
  "reveal-card": RevealCardPreview,
  "chase-border-card": ChaseBorderCardPreview,
  "stagger-text": StaggerTextPreview,
  "draw-underline": DrawUnderlinePreview,
  "blur-swap-link": BlurSwapLinkPreview,
  "slide-marquee-link": SlideMarqueeLinkPreview,
};
