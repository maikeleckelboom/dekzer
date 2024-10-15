<script lang="ts" setup>
const {defaultAngle = 0} = defineProps<{defaultAngle?: number}>()
</script>

<template>
	<div class="stylus w-auto aspect-[1/8] h-1/2 top-0 origin-[50%_100%] absolute bg-background"
			 :style="{ transform: `rotate(${defaultAngle}deg)` }"
			 data-name="stylus"
	/>
</template>