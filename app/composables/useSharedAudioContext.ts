export const useSharedAudioContext = createSharedComposable(() => {
	const audioContext = shallowRef<AudioContext | null>(null)
	const isReady = computed(() => audioContext.value !== null)
	const state = computed(() => audioContext.value?.state || 'closed')

	onMounted(() => {
		audioContext.value ??= new AudioContext({ latencyHint: 'interactive' })
	})

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

	onUnmounted(close)

	return {
		audioContext,
		isReady,
		state,
		close,
		resume,
		suspend
	}
})