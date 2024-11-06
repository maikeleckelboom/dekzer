export const useAudioContext = createSharedComposable(
  (
    options: AudioContextOptions = {
      latencyHint: 'interactive'
    }
  ) => {
    const audioContext = shallowRef<AudioContext>()

    async function getAudioContext(): Promise<AudioContext> {
      const context = audioContext.value ?? new AudioContext(options)

      audioContext.value ??= context

      if (context.state === 'closed') {
        // eslint-disable-next-line no-console
        console.warn('AudioContext was closed unexpectedly')
      }

      // navigator.userActivation.hasBeenActive
      if (context.state === 'suspended') {
        await context.resume()
      }

      return context
    }

    async function closeAudioContext(): Promise<void> {
      if (!audioContext.value) return
      if (audioContext.value.state === 'running') {
        await audioContext.value.close()
      }
      audioContext.value = undefined
    }

    tryOnMounted(getAudioContext)

    onUnmounted(closeAudioContext)

    return {
      audioContext,
      getAudioContext,
      closeAudioContext
    }
  }
)
