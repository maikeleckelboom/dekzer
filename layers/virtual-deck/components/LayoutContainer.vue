<script lang="ts" setup>
defineSlots<{
	stylus: { className: string }
	progress: void
	surface: void
}>()
</script>

<template>
	<div
		:class="
			cn(
				'grid place-items-center relative overflow-clip m-auto',
				'bg-muted border border-background/80 rounded-full',
				'size-48 aspect-square touch-none select-none',
			)
		"
		data-name="layoutContainer">
		<slot name="progress"/>
		<div class="size-[calc(100%-1.325rem)] bg-foreground rounded-full grid place-items-center" data-name="disc">
			<div class="size-5 bg-muted-foreground rounded-full z-30 pointer-events-none" data-name="center" />
			<slot name="stylus"/>
		</div>
		<slot name="surface" />
	</div>
</template>
