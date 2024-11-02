export * from './dynamicsCompressor'

export function createGain(
  context: AudioContext,
  options: { value: number } = { value: 1 }
): GainNode {
  const gain = context.createGain()
  gain.gain.value = options.value
  return gain
}

export function createAnalysers(
  context: AudioContext,
  options: {
    fftSize: 1024 | 2048 | 4096 | 8192 | 16384 | 32768
  } = {
    fftSize: 2048
  }
): [AnalyserNode, AnalyserNode] {
  const analyserL = context.createAnalyser()
  analyserL.fftSize = options.fftSize
  const analyserR = context.createAnalyser()
  analyserR.fftSize = options.fftSize
  return [analyserL, analyserR]
}

export function faderToDB(value: number, minDB: number, maxDB: number): number {
  const scaledValue = (value - 0.5) * 2
  return (scaledValue * (maxDB - minDB)) / 2
}

export function dbToLinearGain(db: number): number {
  return Math.pow(10, db / 20)
}

export function cosineFadeIn(value: number) {
  return Math.cos(value * 0.5 * Math.PI)
}

export function cosineFadeOut(value: number) {
  return Math.cos((1.0 - value) * 0.5 * Math.PI)
}

export function getTempoAdjustment(tempo: number, pitch: number): number {
  return tempo * Math.pow(2, pitch / 12)
}