import { analyze } from 'web-audio-beat-detector'

export async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url, { headers: { ResponseType: 'stream' } })
  const arrayBuffer = await response.arrayBuffer()
  return await context.decodeAudioData(arrayBuffer)
}

export function createBufferSourceNode(
  context: AudioContext,
  buffer: AudioBuffer
): AudioBufferSourceNode {
  const source = context.createBufferSource()
  source.buffer = buffer
  return source
}


export function fadeIn(context: AudioContext, node: AudioBufferSourceNode, duration: number) {
  const gainNode = context.createGain()
  gainNode.gain.setValueAtTime(0, context.currentTime)
  gainNode.gain.linearRampToValueAtTime(1, context.currentTime + duration)
  node.connect(gainNode)
  gainNode.connect(context.destination)
}

export function fadeOut(context: AudioContext, node: AudioBufferSourceNode, duration: number) {
  const gainNode = context.createGain()
  node.connect(gainNode)
  gainNode.connect(context.destination)
  gainNode.gain.setValueAtTime(1, context.currentTime)
  gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration)
}

export async function getAnalyzedTempo(
  url: string,
  context: AudioContext,
  options = {
    minTempo: 60,
    maxTempo: 220
  }
): Promise<number> {
  const buffer = await loadAudioBuffer(context, url)
  return await analyze(buffer, options)
}

export interface DeckNodes {
  gain: GainNode
  volume: GainNode
  mixer: GainNode
  limiter: DynamicsCompressorNode
  analysers: [AnalyserNode, AnalyserNode]
}

export interface MasterNodes {
  gain: GainNode
  limiter: DynamicsCompressorNode
  analysers: [AnalyserNode, AnalyserNode]
}
