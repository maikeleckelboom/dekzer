export const useAudioStore = defineStore('audio.store', () => {
	const audioContext = shallowRef<AudioContext | null>(null)

	onMounted(() => audioContext.value ??= new AudioContext({ latencyHint: 'interactive' }))
	onBeforeUnmount(() => audioContext.value?.close())

	async function getAudioContext(): Promise<AudioContext> {
		const context = unref(audioContext)

		if (!context) {
			throw new Error('AudioContext is not available')
		}

		if (context.state === 'suspended') {
			await context.resume()
		}

		return context
	}

	return {
		audioContext,
		getAudioContext
	}
})