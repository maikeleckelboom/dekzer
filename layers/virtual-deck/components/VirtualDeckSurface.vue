<script setup lang="ts">
const {
	currentTime,
	remainingTime,
	tempo,
	pitch,
	pitchRange,
	disabled = false
} = defineProps<{
	currentTime: number
	remainingTime: number
	tempo?: number
	pitch?: string
	pitchRange?: string
	disabled?: boolean
}>()

const slots = defineSlots<{
	currentTime(time: number): void
	remainingTime(time: number): void
	pitchRange(range: string): void
	pitch(pitch: string): void
	bpm(bpm: string): void
}>()

const currentTimeDisplay = computed(() => {
	if (disabled) return ''
	return currentTime ? formatSeconds(currentTime) : '00:00.0'
})

const remainingTimeDisplay = computed(() => {
	if (disabled) return ''
	return remainingTime ? formatSeconds(remainingTime) : '00:00.0'
})

const bpm = computed(() => {
	if (!tempo) return ''
	return tempo.toFixed(2)
})
</script>

<template>
	<div class="absolute inset-0 items-center z-10 grid grid-rows-[1fr,auto,1fr] grid-cols-2 mt-4 mb-6">
		<div class="flex flex-col items-center col-span-2">
			<strong
				class="capitalize text-2xl tracking-tight font-black whitespace-pre-wrap text-center text-background select-none leading-[1]">
				<slot name="bpm">
					{{ bpm }}
				</slot>
			</strong>
			<p v-if="bpm || slots.bpm" class="text-xs text-center text-background">BPM</p>
		</div>
		<div>
			<slot name="pitch" v-if="pitch || slots.pitch">
				{{ pitch }}
			</slot>
		</div>
		<div>
			<slot name="pitchRange" v-if="pitchRange || slots.pitchRange">
				{{ pitchRange }}
			</slot>
		</div>
		<div class="flex flex-col items-center col-span-2 mt-4">
			<strong
				:class="
					cn('capitalize text-xl font-bold tabular-nums text-center text-background leading-none select-none')
				">
				<slot name="currentTime">
					{{ currentTimeDisplay }}
				</slot>
			</strong>
			<strong
				:class="
					cn('capitalize text-xl font-bold tabular-nums text-center text-background leading-none select-none')
				">
				<slot name="remainingTime">
					{{ remainingTimeDisplay }}
				</slot>
			</strong>
		</div>
	</div>
</template>
