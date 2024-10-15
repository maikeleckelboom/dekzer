// useAudioState.ts
export function useAudioState() {
	const audioBuffer = shallowRef<AudioBuffer>()
	const sourceNode = shallowRef<AudioBufferSourceNode>()

	const currentTime = shallowRef<number>(0)
	const duration = shallowRef<number>(0)
	const playing = shallowRef<boolean>(false)
	const startTime = shallowRef<number>(0)
	const startOffset = shallowRef<number>(0)

	return {
		audioBuffer,
		sourceNode,
		currentTime,
		duration,
		playing,
		startTime,
		startOffset,
	}
}
