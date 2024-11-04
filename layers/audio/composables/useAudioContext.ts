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

      if (!context || context.state === 'closed') {
        throw new Error('AudioContext is closed')
      }

      if (navigator.userActivation.hasBeenActive && context.state === 'suspended') {
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

import type {ShallowRef} from "vue";

export interface AudioElementContext {
  audioElement: ShallowRef<HTMLAudioElement | null>
}

export const AudioElementContextKey = Symbol() as InjectionKey<AudioElementContext>