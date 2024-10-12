<script lang="ts" setup>
interface Props {
	progress: number
}

const { progress } = defineProps<Props>()

defineSlots<{
	positionIndicator: { className: string }
	surface: void
}>()
</script>

<template>
	<div
		:class="
			cn(
				'grid place-items-center relative overflow-clip touch-none',
				'mx-auto size-48 bg-muted border border-background/80 rounded-full'
			)
		"
		data-name="layoutContainer">
		<ProgressIndicator :progress="progress" />
		<div class="size-[calc(100%-1.325rem)] bg-foreground rounded-full grid place-items-center" data-name="disc">
			<div class="size-5 bg-muted-foreground rounded-full z-30 pointer-events-none" data-name="center" />
			<slot
				name="positionIndicator"
				v-bind="{
					className: 'stylus w-auto aspect-[1/8] h-1/2 top-0 origin-[50%_100%] absolute bg-background z-20'
				}" />
		</div>
		<slot name="surface" />
	</div>
</template>
