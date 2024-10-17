async function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const arrayBuffer = await response.arrayBuffer()
	return await context.decodeAudioData(arrayBuffer)
}

function createBufferSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	return bufferSource
}

function fadeIn(node: AudioBufferSourceNode, duration: number) {
	const gainNode = audioContext.createGain()
	gainNode.gain.setValueAtTime(0, audioContext.currentTime)
	gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + duration)
	node.connect(gainNode)
	gainNode.connect(audioContext.destination)
}

function fadeOut(node: AudioBufferSourceNode, duration: number) {
	const gainNode = audioContext.createGain()
	node.connect(gainNode)
	gainNode.connect(audioContext.destination)
	gainNode.gain.setValueAtTime(1, audioContext.currentTime)
	gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration)
}

export {
	loadAudioBuffer,
	createBufferSourceNode,
	fadeIn,
	fadeOut
}