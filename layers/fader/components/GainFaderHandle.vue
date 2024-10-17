<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'

// Props
const { dBMin, dBMax } = defineProps({
	dBMin: { type: Number, default: -12 },
	dBMax: { type: Number, default: 12 }
})

// Model
const modelValue = defineModel<number>('modelValue', {
	type: Number,
	required: true
})

// Constants
const CONTAINER_HEIGHT = 214 as const
const HANDLE_HEIGHT: number = 14 as const

// Reactive state
const top = ref<number>(0) // Position of handle in percentage (0-100)

// Ref for the handle element
const target = useTemplateRef<HTMLDivElement>('handle')
// Use swipe logic with direction handling
const { distanceY, isSwiping } = usePointerSwipe(target, {
	disableTextSelect: true,
	threshold: 0,
	onSwipe(e: PointerEvent, direction: UseSwipeDirection) {
		const directionMultiplier = direction === 'down' ? 1 : -1
		const newTop =  distanceY.value * directionMultiplier / CONTAINER_HEIGHT * 100
		top.value = clamp(newTop, 0, 100)
	},
	onSwipeEnd(e: PointerEvent, direction: UseSwipeDirection) {

	}
})


// Update the handle's position based on modelValue changes
watch(() => modelValue.value, (newValue) => {
	// const percentage = (newValue - dBMin) / (dbMax - dBMin) * 100
	// top.value = percentage
})
watch(top, (newValue) => {

	const mv = (newValue / 100) * (dBMax - dBMin) + dBMin
	console.log('mv', mv)
	modelValue.value = mv
}, { deep: true })

// Computed style for the handle position
const handleStyle = computed(() => ({
	top: `${top.value}%`
}))

watch(handleStyle, (newValue) => {
	console.log('handleStyle', newValue)
}, { deep: true })
</script>

<template>
	<div
		ref="handle"
		:style="handleStyle"
		class="w-full absolute cursor-grab active:cursor-grabbing top-0 left-0 select-none opacity-95">
		<div class="w-full h-[6px] bg-black/60" />
		<div class="w-full h-[2px] bg-foreground" />
		<div class="w-full h-[6px] bg-black/60" />
	</div>
</template>
