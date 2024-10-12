<script lang="ts" setup>

import { clamp } from '@vueuse/core'

const { min, max } = defineProps({
	min: Number,
	max: Number
})

const modelValue = defineModel<number>('modelValue', {
	type: Number,
	required: true
})

const parent = useParentElement()

const { height } = useElementSize(parent)

const HANDLE_TOTAL_HEIGHT: number = 14 as const

const top = computed(() => {
	const percent = (modelValue.value - min) / (max - min)
	const heightPercent = 100 * (HANDLE_TOTAL_HEIGHT / height.value)
	const offsetY = 100 * percent + heightPercent / 2
	return 100 - offsetY
})


const handle = useTemplateRef<HTMLDivElement>('handle')

function convertScale(min: number, max: number, value: number): number {
	return (value - min) / (max - min)
}

const startY = ref<number>(0)

function onPointerdown(event: PointerEvent) {
	if (!handle.value) return

	startY.value = event.clientY

	const handleRect = handle.value.getBoundingClientRect()
	const handleY = handleRect.top + handleRect.height / 2
	const handleOffset = event.clientY - handleY

	function onPointermove(event: PointerEvent) {
		const handleRect = handle.value!.getBoundingClientRect()
		const direction = event.clientY - startY.value
		const percent = direction / height.value
		const value = clamp(modelValue.value + (max - min) * percent, min, max)
		modelValue.value = value

	}

	function onPointerup() {
		window.removeEventListener('pointermove', onPointermove)
		window.removeEventListener('pointerup', onPointerup)
	}

	window.addEventListener('pointermove', onPointermove)
}


const handleStyle = computed(() => ({
	top: `${top.value}%`
}))

</script>

<template>
	<div
		ref="handle"
		:style="handleStyle"
		class="w-full absolute cursor-grab active:cursor-grabbing top-0 left-0 select-none opacity-95"
		@pointerdown.prevent="onPointerdown">
		<div class="w-full h-[6px] bg-black/60" />
		<div class="w-full h-[2px] bg-foreground" />
		<div class="w-full h-[6px] bg-black/60" />
	</div>
</template>
