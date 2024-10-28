export interface DeckNodes {
  gain: GainNode
  volume: GainNode
  pan: GainNode
  limiter: DynamicsCompressorNode
  analyserL: AnalyserNode
  analyserR: AnalyserNode
}