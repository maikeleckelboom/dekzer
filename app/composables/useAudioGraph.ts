import { createDeckNodes, createMasterNodes } from '~/utils/audio'

export interface DeckNodes {
  gain: GainNode
  volume: GainNode
  pan: GainNode
  limiter: DynamicsCompressorNode
  analyserL: AnalyserNode
  analyserR: AnalyserNode
}

export interface MasterNodes {
  gain: GainNode
  limiter: DynamicsCompressorNode
  analyserL: AnalyserNode
  analyserR: AnalyserNode
}


interface AudioGraphNodes {
  decks: [DeckNodes, DeckNodes]
  master: MasterNodes
}

/**
 * Deck A: Gain -> Volume -> Analysers -> Pan -> Limiter ->
 *                                                         | -> Master Limiter -> Output
 * Deck B: Gain -> Volume -> Analysers -> Pan -> Limiter ->
 */