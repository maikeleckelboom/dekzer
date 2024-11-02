export const useAudioContext = createSharedComposable(
  (
    options: AudioContextOptions = {
      latencyHint: 'interactive'
    }
  ) => {
    const audioContext = shallowRef<AudioContext>()

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
      audioContext.value = undefined
    }

    tryOnMounted(getAudioContext)
    onUnmounted(closeAudioContext)

    return {
      audioContext,
      getAudioContext,
      closeAudioContext,
      async unlock() {
        const context = unref(audioContext)
        if (!context) return

        if (context.state === 'suspended') {
          await context.resume()
        }

        const buffer = context.createBuffer(1, 1, context.sampleRate)
        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.start()

        if (source.stop) {
          source.stop()
        } else {
          source.onended = () => {
            source.disconnect()
          }
        }

        return context.resume()
      }
    }
  }
)
