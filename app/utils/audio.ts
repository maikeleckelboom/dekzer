import { analyze } from 'web-audio-beat-detector'
import { createLimiter } from './limiter'

export async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url, { headers: { ResponseType: 'stream' } })
  const arrayBuffer = await response.arrayBuffer()
  return await context.decodeAudioData(arrayBuffer)
}

export function createConstantSourceNode(
  context: AudioContext,
  offsetValue: number = 0
): ConstantSourceNode {
  const constantSourceNode = context.createConstantSource()
  constantSourceNode.offset.value = offsetValue
  constantSourceNode.start(context.currentTime)
  return constantSourceNode
}

export function createBufferSourceNode(
  context: AudioContext,
  buffer: AudioBuffer
): AudioBufferSourceNode {
  const source = context.createBufferSource()
  source.buffer = buffer
  return source
}

export function createAnalysers(
  context: AudioContext,
  fftSize: 1024 | 2048 | 4096 | 8192 | 16384 = 1024
): [AnalyserNode, AnalyserNode] {
  const analyser = context.createAnalyser()
  const analyserR = context.createAnalyser()

  analyser.fftSize = fftSize
  analyserR.fftSize = fftSize

  return [analyser, analyserR]
}

export function canPlay(
  context: MaybeRefOrGetter<AudioContext | null>,
  buffer: MaybeRefOrGetter<AudioBuffer | null>,
  playing: MaybeRefOrGetter<boolean>
): boolean {
  return (toValue(context) && toValue(buffer) && !toValue(playing)) || false
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

export function faderToDB(value: number, minDB: number, maxDB: number): number {
  const normalizedValue = (value - 0.5) * 2
  return (normalizedValue * (maxDB - minDB)) / 2
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

export function createDeckNodes(context: AudioContext): DeckNodes {
  return {
    gain: createGain(context),
    volume: createGain(context),
    mixer: createGain(context, 0),
    limiter: createLimiter(context, 'track'),
    analysers: createAnalysers(context)
  }
}

export function createGain(context: AudioContext, value: number = 1): GainNode {
  const gain = context.createGain()
  gain.gain.value = value
  return gain
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
