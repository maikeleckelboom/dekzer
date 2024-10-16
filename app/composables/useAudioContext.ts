export const useSharedAudioContext = createSharedComposable(() => {
	const audioContext = shallowRef<AudioContext | null>(null)
	const audioContextInitialized = shallowRef(false)
	const audioContextError = shallowRef<Error | null>(null)

	const audioContextInit = async () => {
		if (audioContextInitialized.value) {
			if (audioContext.value!.state === 'suspended') {
				await audioContext.value!.resume()
			}
			return audioContext.value
		}
		try {
			audioContext.value = new AudioContext({ latencyHint: 'interactive' })
			audioContextInitialized.value = true
			return audioContext.value
		} catch (error) {
			audioContextError.value = error
		}
	}

	// onMounted(audioContextInit)

	return {
		audioContext,
		audioContextInitialized,
		audioContextError,
		audioContextInit
	}
})