/** Organic coastal shoreline radius at polar angle theta for Full Stack Island. */
export function getIslandShoreRadius(theta: number): number {
  return (
    49.5 +
    3.4 * Math.sin(theta * 3 + 0.4) +
    2.1 * Math.cos(theta * 5 - 0.8) +
    1.2 * Math.sin(theta * 2 + 1.3)
  );
}

