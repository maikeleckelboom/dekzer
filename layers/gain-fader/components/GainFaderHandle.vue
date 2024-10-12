<script lang="ts" setup>
const { min, max } = defineProps({
	min: Number,
	max: Number
})

const modelValue = defineModel<number>('modelValue', {
	type: Number,
	required: true
})

const parent = useParentElement()

const { height, width } = useElementSize(parent)

const HANDLE_TOTAL_HEIGHT: number = 14 as const

const top = computed(() => {
	const percent = (modelValue.value - min) / (max - min)
	const heightPercent = 100 * (HANDLE_TOTAL_HEIGHT / height.value)
	const offsetY = 100 * percent + heightPercent / 2
	return 100 - offsetY
})

const handleStyle = computed(() => ({
	top: `${top.value}%`
}))
</script>

<template>
	<div
		:style="handleStyle"
		class="h-min w-full absolute cursor-grab active:cursor-grabbing top-0 left-0 opacity-60 select-none">
		<div class="w-full h-[6px] bg-black" />
		<div class="w-full h-[2px] bg-white" />
		<div class="w-full h-[6px] bg-black" />
	</div>
</template>
