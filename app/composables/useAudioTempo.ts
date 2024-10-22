import { guess } from 'web-audio-beat-detector'

export function useAudioTempo(url: MaybeRefOrGetter<string>) {
  const { getAudioContext } = useSharedAudioContext()
  const tempo = shallowRef({ bpm: 0, offset: 0 })
  const status = shallowRef<'idle' | 'pending' | 'error'>('idle')
  const error = shallowRef<Error | null>(null)

  watch(
    () => toValue(url),
    async (url) => {
      if (!url) return
      status.value = 'pending'
      try {
        const context = await getAudioContext()
        const audioBuffer = await loadAudioBuffer()
        tempo.value = await guess(audioBuffer, context.sampleRate)
        status.value = 'idle'
        console.log('Guessed tempo:', tempo.value)
      } catch (err) {
        status.value = 'error'
        error.value = err
        console.error('Failed to guess tempo:', err)
      }
    }
  )

  return {
    tempo,
    status,
    error
  }
}
