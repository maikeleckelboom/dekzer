import type { Track } from '~~/layers/track/types'

export function useTrackPlayback(track: MaybeRefOrGetter<Track>) {
	const audioBuffer = shallowRef<AudioBuffer>()
	const sourceNode = shallowRef<AudioBufferSourceNode>()

	const currentTime = ref<number>(0)
	const duration = ref<number>(0)
	const playing = ref<boolean>(false)


	async function fetchAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
		const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
		const arrayBuffer = await response.arrayBuffer()
		return await context.decodeAudioData(arrayBuffer)
	}

	async function initializeAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
		const buffer = await fetchAudioBuffer(context, url)
		audioBuffer.value = buffer
		duration.value = buffer.duration
		return buffer
	}

	const { initializeAudioContext } = useSharedAudioContext()

	whenever(track, async (track) => {
		const audioContext = await initializeAudioContext()
		const buffer = await initializeAudioBuffer(audioContext, track.url)
		sourceNode.value = audioContext.createBufferSource()
		sourceNode.value.buffer = buffer
		sourceNode.value.connect(audioContext.destination)

		console.log('audioBufferSourceNode', sourceNode.value)
	})

	return {
		audioBuffer,
		sourceNode,
		currentTime,
		duration,
		playing
	}

}