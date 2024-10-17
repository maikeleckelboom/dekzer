<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'

const { dBMin, dBMax } = defineProps({
	dBMin: { type: Number, default: -12 },
	dBMax: { type: Number, default: 12 }
})

const modelValue = defineModel<number>('modelValue', {
	type: Number,
	required: true
})

const CONTAINER_HEIGHT = 214 as const
const HANDLE_HEIGHT = 14 as const
const top = ref<number>(
	(dBMax - modelValue.value) / (dBMax - dBMin) * 100 - HANDLE_HEIGHT / CONTAINER_HEIGHT * 100
)
const offsetStart = ref<number>(0)

const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceY, isSwiping } = usePointerSwipe(target, {
	disableTextSelect: true,
	threshold: 0,
	onSwipeStart(_: PointerEvent, __: UseSwipeDirection) {
		offsetStart.value = top.value
	},
	onSwipe(_: PointerEvent, direction: UseSwipeDirection) {
		const directionMultiplier = direction === 'down' ? 1 : -1
		top.value = clamp(offsetStart.value + directionMultiplier * distanceY.value / CONTAINER_HEIGHT * 100, 0, 100)
	},
	onSwipeEnd(_: PointerEvent, __: UseSwipeDirection) {
		modelValue.value = (dBMax - dBMin) * (top.value / 100) + dBMin
	}
})

const handleStyle = computed(() => ({
	top: `${top.value}%`
}))
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
