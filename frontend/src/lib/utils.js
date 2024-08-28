import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Linear interpolation
export function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

// Get distance between two points
export function getDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
