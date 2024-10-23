function createAudioContext(
  options: AudioContextOptions = { latencyHint: 'interactive' }
): AudioContext {
  return new AudioContext(options)
}

async function stopAudioContext(context: AudioContext): Promise<void> {
  if (!context) return

  if (context.state === 'running') {
    await context.close()
  }
}

export const useAudioContext = createSharedComposable(
  (
    options: AudioContextOptions = {
      latencyHint: 'interactive'
    }
  ) => {
    const audioContext = shallowRef<AudioContext | null>(null)

    async function getAudioContext(): Promise<AudioContext> {
      audioContext.value ??= createAudioContext(options)

      const context = unref(audioContext)!

      if (context.state === 'suspended' && navigator.userActivation.hasBeenActive) {
        await context.resume()
      }

      return context
    }

    async function closeAudioContext(): Promise<void> {
      if (!audioContext.value) return
      await stopAudioContext(audioContext.value)
      audioContext.value = null
    }

    onMounted(async () => {
      if (navigator.userActivation.hasBeenActive) {
        await getAudioContext()
      }
    })

    onUnmounted(async () => {
      await closeAudioContext()
    })

    return {
      audioContext,
      getAudioContext,
      closeAudioContext,
    }
  }
)

export const useSharedAudioContext = useAudioContext