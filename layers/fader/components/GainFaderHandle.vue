<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'

const { dBMin = -12, dBMax = 12 } = defineProps<{
	dBMin: number
	dBMax: number
}>()

const modelValue = defineModel<number>('modelValue', {
	type: Number,
	required: true
})

const CONTAINER_HEIGHT = 214 as const
const HANDLE_HEIGHT = 14 as const
const top = ref<number>(
	(dBMax - modelValue.value) / (dBMax - dBMin) * 100 - (HANDLE_HEIGHT / CONTAINER_HEIGHT * 100)
)

function getProgress(value: number) {
	const range = convertRange(unref(dBMin), unref(dBMax), 0, 100, value)
	return clamp(range, 0, 100)
}


const offsetStart = ref<number>(0)
const isPointerdown = ref<boolean>(false)
const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceY, isSwiping } = usePointerSwipe(target, {
	disableTextSelect: true,
	threshold: 0,
	onSwipeStart(event: PointerEvent) {
		event.preventDefault()
		offsetStart.value = top.value
	},
	onSwipe(_: PointerEvent, direction: UseSwipeDirection) {
		const multiplier = direction === 'down' ? 1 : -1 // Down should increase, up should decrease

		// Adjust progress based on swipe direction and distance
		const progress = offsetStart.value + (multiplier * distanceY.value / CONTAINER_HEIGHT * 100)

		// Make sure the top value is clamped within the container
		const delta = (HANDLE_HEIGHT / CONTAINER_HEIGHT * 100)
		top.value = clamp(progress, 0, 100 - delta)

		// calc dB gain from progress
		const converted = convertRange(0, 100 - HANDLE_HEIGHT, unref(dBMin), unref(dBMax), top.value)
		modelValue.value = clamp(converted, unref(dBMin), unref(dBMax))

	},
	onSwipeEnd() {
		offsetStart.value = top.value
	}
})

const handleStyle = computed(() => ({
	top: `${clamp(top.value, 0, 100)}%`,
	zIndex: isSwiping.value ? 1 : 0,
	touchAction: isSwiping.value ? 'none' : 'auto',
	opacity: isPointerdown.value ? 1 : 0.9
}))
</script>

<template>
	<div
		ref="handle"
		:style="handleStyle"
		class="w-full absolute cursor-grab active:cursor-grabbing top-0 left-0 select-none">
		<div class="w-full h-[6px] bg-black/60" />
		<div class="w-full h-[2px] bg-foreground" />
		<div class="w-full h-[6px] bg-black/60" />
	</div>
</template>
