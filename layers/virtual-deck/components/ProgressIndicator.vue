<script lang="ts" setup>
interface Props {
	progress: number
}

const { progress} = defineProps<Props>()

const CIRCLE_SIZE = 100

const viewBox = `0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`
const strokeDashArray = 314
const cx = computed(() => CIRCLE_SIZE / 2)
const cy = computed(() => CIRCLE_SIZE / 2)
const r = computed(() => CIRCLE_SIZE / 2)
const strokeDasharray = computed(() => 2 * Math.PI * r.value)
const strokeDashoffset = computed(() => strokeDasharray.value * (1 - progress))
const strokeWidth = 12
</script>

<template>
	<svg :viewBox="viewBox" class="absolute size-full" data-name="progress-circle">
		<circle
			:cx="cx"
			:cy="cy"
			:r="r"
			:stroke-dasharray="strokeDashArray"
			:stroke-dashoffset="strokeDashoffset"
			:stroke-width="strokeWidth"
			class="fill-none transform -rotate-90 origin-center stroke-muted-foreground"
		/>
	</svg>
</template>
