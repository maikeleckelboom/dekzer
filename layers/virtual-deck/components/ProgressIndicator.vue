<script lang="ts" setup>
interface Props {
	progress: number
	size?: number
}

const { progress, size = 100 } = defineProps<Props>()

const viewBox = `0 0 ${size} ${size}`
const strokeDashArray = 314
const cx = computed(() => size / 2)
const cy = computed(() => size / 2)
const r = computed(() => size / 2)
const strokeDasharray = computed(() => 2 * Math.PI * r.value)
const strokeDashoffset = computed(() => strokeDasharray.value * (1 - progress))
const strokeWidth = 12

watchEffect(() => {
	console.log({ cx, cy, r, strokeDashArray, strokeDashoffset, strokeWidth })
})
</script>

<template>
	<svg :viewBox="viewBox" class="absolute size-full z-10" data-name="progress-circle">
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
