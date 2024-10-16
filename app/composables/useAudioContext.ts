export const useSharedAudioContext = createSharedComposable(() => {
	const audioContext = shallowRef<AudioContext | null>(null)
	const audioContextInitialized = shallowRef(false)
	const audioContextError = shallowRef<Error | null>(null)

	const audioContextInit = async () => {
		try {
			audioContext.value = new AudioContext({ latencyHint: 'interactive' })
			audioContextInitialized.value = true
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