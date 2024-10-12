export function usePlatterPosition(currentTime: MaybeRefOrGetter<number>, rate: MaybeRefOrGetter<number> = 1) {
	const angle = ref<number>(0)

	const getRevolutionsPerSecond = (rpm: number) => rpm / 60
	const getAnglePerSecond = (rpm: number) => 360 * getRevolutionsPerSecond(rpm)

	function angleFromSeconds(timeInSeconds: number) {
		const anglePerSecond = getAnglePerSecond(VINYL_RPM * toValue(rate))
		return (timeInSeconds * anglePerSecond) % 360
	}

	watch(() => toValue(currentTime), (timeInSeconds) => {
		angle.value = angleFromSeconds(timeInSeconds)
	}, { immediate: true })

	return {
		angle,
		angleFromSeconds
	}
}
