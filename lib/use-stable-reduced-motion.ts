"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function getSnapshot() {
  return window.matchMedia(query).matches;
}
function getServerSnapshot() {
  // A consistent value during server rendering and hydration prevents mismatched motion styles.
  return false;
}

export default function useStableReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
