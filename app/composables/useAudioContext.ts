export const useAudioContext = createSharedComposable((contextOptions: AudioContextOptions = { latencyHint: 'interactive' }) => {
	/**
	 * Audio context
	 */
	const audioContext = useState<AudioContext | null>('audioContext', () => null)
	const state = computed<AudioContextState>(() => audioContext.value?.state ?? 'closed')
	const isReady = computed<boolean>(() => audioContext.value !== null)

	/**
	 * Suspends the audio context if it's running.
	 * @returns A promise that resolves when the audio context is suspended.
	 */
	async function suspend() {
		if (!audioContext.value || audioContext.value.state === 'suspended') {
			return
		}
		await audioContext.value.suspend()
	}

	/**
	 * Resumes the audio context if it's suspended.
	 * @returns A promise that resolves when the audio context is resumed.
	 */
	async function resume() {
		if (!audioContext.value || audioContext.value.state === 'running') {
			return
		}
		await audioContext.value.resume()
	}

	/**
	 * Closes the audio context.
	 * @returns A promise that resolves when the audio context is closed.
	 */
	async function close() {
		if (!audioContext.value || audioContext.value.state === 'closed') {
			return
		}
		await audioContext.value.close()
		audioContext.value = null
	}

	/**
	 * Initializes the audio context and resumes it if it's suspended.
	 * @returns The initialized audio context.
	 */
	async function initializeContext(): AudioContext {
		const context = audioContext.value ??= new AudioContext(contextOptions)
		if (import.meta.client && navigator.userActivation.hasBeenActive && context.state === 'suspended') {
			await context.resume()
		}
		return context
	}

	/**
	 * Initializes the audio context when the component is mounted.
	 */
	onMounted(initializeContext)

	/**
	 * Closes the audio context when the component unmounts.
	 */
	onBeforeUnmount(close)

	return {
		audioContext,
		isReady,
		state,
		close,
		resume,
		suspend,
		initializeContext
	}
})
