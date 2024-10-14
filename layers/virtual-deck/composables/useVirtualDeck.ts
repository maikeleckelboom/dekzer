import { usePlatterPosition } from '~~/layers/virtual-deck/composables/usePlatterPosition'
import { clamp, type MaybeElementRef } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

export function useVirtualDeck(
	deck: MaybeElementRef<HTMLElement>,
	stylus: MaybeElementRef<HTMLElement>,
	currentTime: Ref<number>,
	duration: MaybeRefOrGetter<number>,
	playbackRate: MaybeRefOrGetter<number> = 1
) {
	let elDeck: HTMLElement | null = null
	let elStylus: HTMLElement | null = null

	onMounted(() => {
		elDeck = unrefElement(deck)
		elStylus = unrefElement(stylus)

		if (!elDeck || !elStylus) {
			throw new Error('You need to provide both deck and stylus elements')
		}
	})

	const progress = computed(() => {
		const currTime = toValue(currentTime) ?? 0
		const totalTime = toValue(duration) ?? 10
		return clamp(currTime / totalTime, 0, 1)
	})

	const angleStart = ref<number>(0)
	const isInteracting = ref<boolean>(false)

	function setPointerCapture(pointerId: number) {
		if (!elDeck?.setPointerCapture) return
		elDeck!.setPointerCapture(pointerId)
	}
	function releasePointerCapture(pointerId: number) {
		if (!elDeck?.releasePointerCapture) return
		elDeck!.releasePointerCapture(pointerId)
	}

	function startInteract(event: PointerEvent) {
		setPointerCapture(event.pointerId)
		angleStart.value = getPointerAngle(event)
		isInteracting.value = true
	}

	function getPointerAngle({ clientX, clientY }: PointerEvent) {
		const { left, top, width, height } = elDeck!.getBoundingClientRect()
		const x = clientX - left - width / 2
		const y = clientY - top - height / 2
		const rotation = Math.atan2(y, x) * (180 / Math.PI) + 90
		return rotation < 0 ? rotation + 360 : rotation
	}

	const { angle, angleFromSeconds } = usePlatterPosition(currentTime)

	function handlePointerMovement(event: PointerEvent) {
		if (!isInteracting.value) return

		const pointerAngle = getPointerAngle(event)
		const angleDelta = pointerAngle - angleStart.value
		angleStart.value = pointerAngle

		const normalizeAngle = (r: number) => (r > 180 ? r - 360 : r < -180 ? r + 360 : r)
		const normalizedDelta = normalizeAngle(angleDelta)
		const seekedAngle = (angle.value + normalizedDelta) % 360
		const deltaTime = (normalizedDelta / 360) * (60 / VINYL_RPM) * toValue(playbackRate)
		const seekedTime = currentTime.value + deltaTime

		angle.value = seekedAngle
		currentTime.value = seekedTime
	}

	function stopInteract(event: PointerEvent) {
		releasePointerCapture(event.pointerId)
		isInteracting.value = false
	}

	useEventListener(deck, 'pointerdown', (pdEvent: PointerEvent) => {
		startInteract(pdEvent)

		const cleanupPm = useEventListener('pointermove', (pmEvent: PointerEvent) => {
			handlePointerMovement(pmEvent)
		})

		const cleanupPu = useEventListener('pointerup', (puEvent: PointerEvent) => {
			stopInteract(puEvent)
			cleanupPm()
			cleanupPu()
		})
	})

	watch(currentTime, (timeInSeconds) => {
		if (!elStylus) return
		const angle = angleFromSeconds(timeInSeconds)
		elStylus!.style.transform = `rotate(${angle}deg)`
	})

	return {
		isInteracting,
		angle,
		angleFromSeconds,
		progress
	}
}