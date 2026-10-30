import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

let registered = false;

/** Registers GSAP plugins once, on the client only. */
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True on a desktop with a fine pointer that can hover (no touch first devices). */
export function isFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Rich effects (3D, tilt, cursor, smooth scroll) only on capable desktops without reduced motion. */
export function richMotion() {
  return isFinePointer() && !prefersReducedMotion();
}

let lenisInstance: Lenis | null = null;
export function setLenis(l: Lenis | null) {
  lenisInstance = l;
}
export function getLenis() {
  return lenisInstance;
}

/** Scroll velocity shared with effects that react to it (ticker, marquee). */
export const scrollState = { velocity: 0 };
