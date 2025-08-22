export function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function chance(p) {
  return Math.random() < p;
}
