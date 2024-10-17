export const useSharedAudioContext = createSharedComposable((options: AudioContextOptions = {
	latencyHint: 'interactive'
}) => {
	const audioContext = shallowRef<AudioContext | null>(null)
	const audioContextError = shallowRef<Error | null>(null)
	const initialized = shallowRef<boolean>(false)

	async function initializeAudioContext() {
		if (initialized.value) {
			return await resumeAudioContext()
		}
		try {
			audioContext.value = new AudioContext(options)
			initialized.value = true
			return audioContext.value
		} catch (error) {
			error.value = error
		}
	}

	async function resumeAudioContext() {
		if (audioContext.value && audioContext.value.state === 'suspended') {
			await audioContext.value.resume()
		}
		return audioContext.value
	}

	return {
		audioContext,
		audioContextError,
		initialized,
		initializeAudioContext
	}
})