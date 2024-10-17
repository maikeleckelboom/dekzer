async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const arrayBuffer = await response.arrayBuffer()
	return await context.decodeAudioData(arrayBuffer)
}
export function createBufferSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	return bufferSource
}
function playAudioBuffer(context: AudioContext, buffer: AudioBuffer): void {
	const source = context.createBufferSource()
	source.buffer = buffer
	source.connect(context.destination)
	source.start()
}

export {
	loadAudioBuffer,
	playAudioBuffer,
}