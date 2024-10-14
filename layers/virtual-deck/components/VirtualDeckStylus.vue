<script lang="ts" setup>
const {initialAngle = 0} = defineProps<{initialAngle?: number}>()
</script>

<template>
	<div class="stylus w-auto aspect-[1/8] h-1/2 top-0 origin-[50%_100%] absolute bg-background"
			 :style="{ transform: `rotate(${initialAngle}deg)` }"
			 data-name="VirtualDeckStylus"
	/>
</template>