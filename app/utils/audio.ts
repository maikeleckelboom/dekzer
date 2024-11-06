import { analyze } from 'web-audio-beat-detector'

export async function loadArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url, { headers: { ResponseType: 'stream' } })
    return await response.arrayBuffer()
}

export async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  const arrayBuffer = await loadArrayBuffer(url)
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
export async function playSourceNode(
  context: AudioContext,
  buffer: AudioBuffer,
  offset = 0,
  duration = buffer.duration
): Promise<AudioBufferSourceNode> {
  const source = createBufferSourceNode(context, buffer)
  source.start(0, offset, duration)
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