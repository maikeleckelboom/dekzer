export async function fetchAndDecodeAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const arrayBuffer = await response.arrayBuffer()
	return await context.decodeAudioData(arrayBuffer)
}

export function createBufferSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	return bufferSource
}

export function calculateCurrentTime(context: AudioContext, startTime: number, startOffset: number): number {
	return context.currentTime - startTime + startOffset
}
