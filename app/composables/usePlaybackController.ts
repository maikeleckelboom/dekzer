import { useAudioState } from './useAudioState'

export function usePlaybackController(audioContext: Ref<AudioContext | null>) {
	const { audioBuffer, sourceNode, currentTime, startTime, startOffset, playing, duration } = useAudioState()

	let rAF: number | null = null

	function resetState() {
		if (rAF !== null) cancelAnimationFrame(rAF)
		duration.value = 0
		currentTime.value = 0
		startOffset.value = 0
		startTime.value = 0
		playing.value = false
		audioBuffer.value = undefined
		sourceNode.value = undefined
	}

	function updateCurrentTime() {
		const context = unref(audioContext)
		if (context) {
			currentTime.value = calculateCurrentTime(context, startTime.value, startOffset.value)
		}
	}

	function renderAnimationFrame() {
		updateCurrentTime()
		console.log('Rendering animation frame')
		rAF = requestAnimationFrame(renderAnimationFrame)
	}

	function startPlaying() {
		playing.value = true
		if (rAF !== null) cancelAnimationFrame(rAF)
		rAF = requestAnimationFrame(renderAnimationFrame)
	}

	function stopPlaying(source: AudioBufferSourceNode) {
		playing.value = false
		if (rAF !== null) cancelAnimationFrame(rAF)
		source.stop()
	}

	async function play(context: AudioContext, buffer: AudioBuffer) {

		if (!context) {
			console.warn('Cannot play audio: context is not initialized')
			return
		}

		if (!buffer) {
			console.warn('Cannot play audio: buffer is not initialized')
			return
		}

		startTime.value = context.currentTime
		const source = createBufferSource(context, buffer)
		sourceNode.value = source
		source.connect(context.destination)

		const isOutOfRange = startOffset.value >= buffer.duration || startOffset.value < 0
		if (isOutOfRange) {
			console.warn('Cannot play audio: startOffset is out of range')
			return
		}

		source.start(0, startOffset.value % buffer.duration, buffer.duration - startOffset.value)
		startPlaying()
	}

	function pause(context: AudioContext) {
		if (!playing.value) return
		const source = unref(sourceNode)
		if (!context || !source) {
			console.warn('Cannot pause audio: context or source is not initialized')
			return
		}
		startOffset.value += context.currentTime - startTime.value
		stopPlaying(source)
	}

	onUnmounted(resetState)

	return {
		play,
		pause,
		resetState,
		renderAnimationFrame,
		audioBuffer,
		sourceNode,
		currentTime,
		duration,
		playing,
		startTime,
		startOffset
	}
}
