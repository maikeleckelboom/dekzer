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

async function playAudio(deckIndex: number, audioBuffer: AudioBuffer, context: AudioContext) {
  // Create an audio buffer source node
  const source = context.createBufferSource()
  source.buffer = audioBuffer // Set the buffer you loaded
  // Connect the source to the corresponding deck gain node
  // source.connect(deckGainNodes.value[deckIndex]) // Connect source to deck gain node
  // source.start() // Start playback
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
  fftSize = 2048
): [AnalyserNode, AnalyserNode] {
  const analyser = context.createAnalyser()
  const analyserR = context.createAnalyser()

  analyser.fftSize = fftSize
  analyserR.fftSize = fftSize

  return [analyser, analyserR]
}

export function createAnalyserNodes(
  context: AudioContext,
  source: AudioBufferSourceNode
): [AnalyserNode, AnalyserNode] {
  const [analyser, analyserR] = createAnalysers(context)
  const splitter = context.createChannelSplitter(2)

  source.connect(splitter)
  splitter.connect(analyser, 0)
  splitter.connect(analyserR, 1)

  return [analyser, analyserR]
}

export function setupDestination(context: AudioContext, source: AudioBufferSourceNode) {
  source.connect(context.destination)
}

export function canPlay(
  context: MaybeRefOrGetter<AudioContext | null>,
  buffer: MaybeRefOrGetter<AudioBuffer | null>,
  playing: MaybeRefOrGetter<boolean>
): boolean {
  return (toValue(context) && toValue(buffer) && !toValue(playing)) || false
}

export function fadeIn(context:AudioContext, node: AudioBufferSourceNode, duration: number) {
  const gainNode = context.createGain()
  gainNode.gain.setValueAtTime(0, context.currentTime)
  gainNode.gain.linearRampToValueAtTime(1, context.currentTime + duration)
  node.connect(gainNode)
  gainNode.connect(context.destination)
}

export function fadeOut(context:AudioContext, node: AudioBufferSourceNode, duration: number) {
  const gainNode = context.createGain()
  node.connect(gainNode)
  gainNode.connect(context.destination)
  gainNode.gain.setValueAtTime(1, context.currentTime)
  gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration)
}
