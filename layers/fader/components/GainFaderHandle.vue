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

function getInitialTop(value: number, min: number, max: number) {
	return (dBMax - value) / (max - min) * 100 - (HANDLE_HEIGHT / CONTAINER_HEIGHT * 100)
}

const top = ref<number>(getInitialTop(modelValue.value, dBMin, dBMax))

const offsetStart = ref<number>(0)
const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceY, isSwiping } = usePointerSwipe(target, {
	disableTextSelect: true,
	threshold: 0,
	onSwipeStart(event: PointerEvent) {
		event.preventDefault()
		offsetStart.value = top.value
	},
	onSwipe(_: PointerEvent, direction: UseSwipeDirection) {
		const multiplier = direction === 'down' ? 1 : -1
		const progress = offsetStart.value + (multiplier * distanceY.value / CONTAINER_HEIGHT * 100)
		const delta = (HANDLE_HEIGHT / CONTAINER_HEIGHT * 100)
		const converted = convertRange(0, 100 - HANDLE_HEIGHT, dBMin, dBMax, top.value)
		top.value = clamp(progress, 0, 100 - delta)
		modelValue.value = clamp(converted * -1, dBMin, dBMax)
	}
})
</script>

<template>
	<div
		ref="handle"
		:style="{
			top: `${clamp(top, 0, 100)}%`,
			zIndex: isSwiping ? 1 : 0,
			touchAction: isSwiping ? 'none' : 'auto'
		}"
		class="w-full absolute cursor-grab active:cursor-grabbing top-0 left-0 select-none">
		<div class="w-full h-[6px]" :class="isSwiping ? 'bg-background/80' : 'bg-background/50'" />
		<div class="w-full h-[2px] bg-foreground" />
		<div class="w-full h-[6px]" :class="isSwiping ? 'bg-background/80' : 'bg-background/50'" />
	</div>
</template>
