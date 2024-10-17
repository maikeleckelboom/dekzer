function createAudioContext(options: AudioContextOptions = { latencyHint: 'interactive' }): AudioContext {
	return new AudioContext(options)
}

async function stopAudioContext(context: AudioContext): Promise<void> {
	if (!context) return

	if (context.state === 'running') {
		await context.close()
	}
}

export const useSharedAudioContext = createSharedComposable((options: AudioContextOptions = {
	latencyHint: 'interactive'
}) => {
	const audioContext = shallowRef<AudioContext | null>(null)

	async function getAudioContext(): Promise<AudioContext> {
		const context = createAudioContext(options)

		if (!audioContext.value) {
			audioContext.value = context
		}

		if (context.state === 'suspended') {
			await context.resume()
		}

		return context
	}

	async function closeAudioContext(): Promise<void> {
		if (!audioContext.value) return
		await stopAudioContext(audioContext.value)
		audioContext.value = null
	}

	onMounted(() => {
		if (navigator.userActivation.hasBeenActive) {
			getAudioContext().then(() => {
				console.log('Audio context ready')
			})
		}
	})

	return {
		audioContext,
		getAudioContext,
		closeAudioContext
	}
})