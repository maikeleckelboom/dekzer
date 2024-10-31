import { isNull, isUndefined } from 'is-what'

export interface UseAudioBufferOptions {
  url?: MaybeRefOrGetter<string>
}

export function useAudioBuffer(options: UseAudioBufferOptions = {}) {
  const buffer = shallowRef<AudioBuffer>()
  const status = shallowRef<'idle' | 'pending' | 'ready' | 'error'>('idle')
  const error = shallowRef<unknown>()

  const { audioContext } = useAudioContext()

  watch(buffer, (newBuffer) => {
    status.value = 'idle'
    error.value = undefined
    buffer.value = newBuffer ?? undefined
  })

  watch(
    () => toValue(options.url),
    async (url) => {
      if(isNull(url) || isUndefined(url)){
        buffer.value = undefined
      } else {
        await fetchBuffer(url)
      }
    }
  )

  async function fetchBuffer(url:string) {
    try {
      status.value = 'pending'
      const context = audioContext.value!
      const response = await fetch(url, { method: 'GET' })
      const audioBuffer = await response.arrayBuffer()
      buffer.value = await context.decodeAudioData(audioBuffer)
      status.value = 'ready'
    } catch (err: unknown) {
      status.value = 'error'
      error.value = err
    }
  }

  return {
    buffer,
    status,
    error
  }
}
