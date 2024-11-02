export * from './dynamicsCompressor'

export function createGain(context: AudioContext, value: number = 1): GainNode {
  const gain = context.createGain()
  gain.gain.value = value
  return gain
}

export function createAnalysers(
  context: AudioContext,
  options: {
    fftSize: 1024 | 2048 | 4096 | 8192 | 16384
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
