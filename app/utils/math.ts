export const convertRange = (min: number, max: number, a: number, b: number, x: number) => {
  const temp = max - min
  if (temp === 0) return a
  return ((b - a) * (x - min)) / temp + a
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const range = inMax - inMin
  if (range === 0) return outMin
  return ((value - inMin) * (outMax - outMin)) / range + outMin
}

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
