export function usePlatterPosition(
  currentTime: MaybeRefOrGetter<number>,
  playbackRate: MaybeRefOrGetter<number> = 1
) {
  const angle = ref<number>(0)

  const getAnglePerSecond = (rpm: number) => (360 * rpm) / 60

  function angleFromSeconds(timeInSeconds: number) {
    const anglePerSecond = getAnglePerSecond(VINYL_RPM * toValue(playbackRate))
    return (timeInSeconds * anglePerSecond) % 360
  }

  watch(
    () => toValue(currentTime),
    (timeInSeconds) => {
      angle.value = angleFromSeconds(timeInSeconds)
    },
    { immediate: true }
  )

  return {
    angle,
    angleFromSeconds
  }
}
