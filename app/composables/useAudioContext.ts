export const useAudioContext = createSharedComposable((options?: AudioContextOptions) => {
  const audioContext = shallowRef<AudioContext | null>(null)

  async function getAudioContext(): Promise<AudioContext> {
    audioContext.value ??= new AudioContext(options)

    const context = unref(audioContext)!

    if (context.state === 'suspended' && navigator.userActivation.hasBeenActive) {
      await context.resume()
    }

    return context
  }

  async function closeAudioContext(): Promise<void> {
    if (!audioContext.value) return
    if (audioContext.value.state === 'running') {
      await audioContext.value.close()
    }
    audioContext.value = null
  }

  onMounted(async () => {
    if (navigator.userActivation.hasBeenActive) {
      await getAudioContext()
    }
  })

  onUnmounted(closeAudioContext)

  return {
    audioContext,
    getAudioContext,
    closeAudioContext
  }
})
