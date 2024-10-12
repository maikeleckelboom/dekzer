<script lang="ts" setup>
defineSlots<{
	positionIndicator: { className: string }
	progressIndicator: void
	surface: void
}>()
</script>

<template>
	<div
		:class="
			cn(
				'grid place-items-center relative overflow-clip touch-none select-none',
				'bg-muted border border-background/80 rounded-full',
				'size-48 aspect-square',
			)
		"
		data-name="layoutContainer">
		<slot name="progressIndicator"/>
		<div class="size-[calc(100%-1.325rem)] bg-foreground rounded-full grid place-items-center" data-name="disc">
			<div class="size-5 bg-muted-foreground rounded-full z-30 pointer-events-none" data-name="center" />
			<slot
				name="positionIndicator"
				v-bind="{
					className: 'stylus w-auto aspect-[1/8] h-1/2 top-0 origin-[50%_100%] absolute bg-background -z-0'
				}" />
		</div>
		<slot name="surface" />
	</div>
</template>
