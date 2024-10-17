async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const arrayBuffer = await response.arrayBuffer()
	return await context.decodeAudioData(arrayBuffer)
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