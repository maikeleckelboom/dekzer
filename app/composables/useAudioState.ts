export function useAudioState() {
  const currentTime = shallowRef<number>(0)
  const duration = shallowRef<number>(0)
  const playing = shallowRef<boolean>(false)
  const startTime = shallowRef<number>(0)
  const startOffset = shallowRef<number>(0)

  return {
    currentTime,
    duration,
    playing,
    startTime,
    startOffset
  }
}
