export const useAudioContext = createSharedComposable(
  (
    options: AudioContextOptions = {
      latencyHint: 'interactive'
    }
  ) => {
    const audioContext = shallowRef<AudioContext>()

    async function getAudioContext(): Promise<AudioContext> {
      audioContext.value ??= new AudioContext(options)

      const context = unref(audioContext)

      if(!context) throw new Error('AudioContext is not initialized')

      // && navigator.userActivation.hasBeenActive
      if (context.state === 'suspended' && 'resume' in context) {
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
      closeAudioContext,
      async unlock() {
        const context = await getAudioContext()
        if (context.state === 'suspended') {
          await context.resume()
        }
        const buffer = context.createBuffer(1, 1, 22050)
        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.start()
        source.stop()
      }
    }
  }
)
