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

const { height } = useElementSize(parent)

const HANDLE_TOTAL_HEIGHT: number = 14 as const

const top = computed(() => {
	const percent = (modelValue.value - min) / (max - min)
	const heightPercent = 100 * (HANDLE_TOTAL_HEIGHT / height.value)
	const offsetY = 100 * percent + heightPercent / 2
	return 100 - offsetY
})


const element = useTemplateRef<HTMLDivElement>('handle')

const handleStyle = computed(() => ({
	top: `${top.value}%`
}))

defineExpose({
	top
})
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
