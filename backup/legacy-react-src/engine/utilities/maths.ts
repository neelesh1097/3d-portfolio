export interface Point2D {
  x: number;
  y: number;
}

export function clamp(input: number, min: number, max: number): number {
  return Math.max(min, Math.min(input, max));
}

export function remap(
  input: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number
): number {
  return ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow;
}

export function remapClamp(
  input: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number
): number {
  const mapped = ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow;
  const lo = outLow < outHigh ? outLow : outHigh;
  const hi = outLow > outHigh ? outLow : outHigh;
  return clamp(mapped, lo, hi);
}

export function lerp(start: number, end: number, ratio: number): number {
  return (1 - ratio) * start + ratio * end;
}

export function smoothstep(value: number, min: number, max: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

const TAU = 2 * Math.PI;
function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}
function equivalent(a: number): number {
  return mod(a + Math.PI, TAU) - Math.PI;
}

export function smallestAngle(current: number, target: number): number {
  return equivalent(target - current);
}

export function dist2D(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function lineIntersectsCircle(
  p1: Point2D,
  p2: Point2D,
  center: Point2D,
  radius: number
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist2D(p1, center) <= radius;

  const fx = center.x - p1.x;
  const fy = center.y - p1.y;
  const t = clamp((fx * dx + fy * dy) / lenSq, 0, 1);
  const cx = p1.x + t * dx;
  const cy = p1.y + t * dy;

  return Math.hypot(cx - center.x, cy - center.y) <= radius;
}

export function pointInPolygon(point: Point2D, poly: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function circleIntersectsPolygon(
  center: Point2D,
  radius: number,
  poly: Point2D[]
): boolean {
  for (const p of poly) {
    if (dist2D(p, center) <= radius) return true;
  }
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    if (lineIntersectsCircle(p1, p2, center, radius)) return true;
  }
  return pointInPolygon(center, poly);
}

