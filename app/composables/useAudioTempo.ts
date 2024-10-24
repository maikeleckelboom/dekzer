import { guess } from 'web-audio-beat-detector'

export function useAudioTempo(url: MaybeRefOrGetter<string>) {
  const { getAudioContext } = useSharedAudioContext()
  const tempo = shallowRef({ bpm: 0, offset: 0 })
  const status = shallowRef<'idle' | 'pending' | 'error'>('idle')
  const error = shallowRef<unknown | null>(null)

  watch(
    () => toValue(url),
    async (uri) => {
      if (!uri) return
      status.value = 'pending'
      try {
        const context = await getAudioContext()
        const audioBuffer = await loadAudioBuffer(context, uri)
        tempo.value = await guess(audioBuffer, context.sampleRate)
        status.value = 'idle'
      } catch (err) {
        status.value = 'error'
        error.value = err
      }
    }
  )

  return {
    tempo,
    status,
    error
  }
}
