export * from './dynamicsCompressor'

export function createGain(context: AudioContext, value: number = 1): GainNode {
  const gain = context.createGain()
  gain.gain.value = value
  return gain
}

export function createAnalysers(
  context: AudioContext,
  fftSize: number = 2048
): [AnalyserNode, AnalyserNode] {
  const analyserLeft = context.createAnalyser()
  const analyserRight = context.createAnalyser()
  analyserLeft.fftSize = analyserRight.fftSize = fftSize
  return [analyserLeft, analyserRight]
}
