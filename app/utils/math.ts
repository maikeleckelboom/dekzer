export const convertRange = (min: number, max: number, a: number, b: number, x: number) => {
  const temp = max - min
  if (temp === 0) return a
  return ((b - a) * (x - min)) / temp + a
}
export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}
