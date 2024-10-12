function useAudioContext(contextOptions: AudioContextOptions = { latencyHint: 'interactive' }) {
	const audioContext = useState<AudioContext | null>('audioContext', () => null)

	const isReady = computed<boolean>(() => audioContext.value !== null)
	const state = computed<AudioContextState>(() => audioContext.value?.state ?? 'closed')

	onMounted(() => {
		audioContext.value ??= new AudioContext(contextOptions)
	})

	onUnmounted(close)

	async function suspend() {
		if (!audioContext.value || audioContext.value.state === 'suspended') {
			return
		}
		await audioContext.value.suspend()
	}

	async function resume() {
		if (!audioContext.value || audioContext.value.state === 'running') {
			return
		}
		await audioContext.value.resume()
	}

	async function close() {
		if (!audioContext.value || audioContext.value.state === 'closed') {
			return
		}
		await audioContext.value.close()
	}

	return {
		audioContext,
		isReady,
		state,
		close,
		resume,
		suspend
	}
}

export const useSharedAudioContext = createSharedComposable(useAudioContext)
