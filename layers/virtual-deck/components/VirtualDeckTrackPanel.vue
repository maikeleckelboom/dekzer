<script lang="ts" setup>
interface TrackPanelProps {
	elapsedTime: number
	duration: number
	bpm: number
	pitch: string | number
	pitchRange: string | number
}

const {
	elapsedTime,
	duration,
	bpm,
	pitch,
	pitchRange
} = defineProps<Partial<TrackPanelProps>>()

const slots = defineSlots<{
	elapsedTime(time: number): void
	remainingTime(time: number): void
	pitch(pitch: string): void
	pitchRange(range: string): void
	bpm(bpm: number): void
}>()

const elapsedTimeDisplay = computed(() => {
	return elapsedTime ? formatSeconds(elapsedTime) : '' // '00:00.0'
})

const remainingTimeDisplay = computed(() => {
	return duration ? formatSeconds(duration - elapsedTime) : ''// '00:00.0'
})

const bpmDisplay = computed(() => {
	if (typeof bpm === 'undefined') return ''
	const isRound = bpm % 1 === 0
	return isRound ? bpm.toString() : bpm.toFixed(2)
})

function getSign(value: number): string {
	return value >= 0 ? '+' : ''
}

const pitchDisplay = computed(() => {
	if (typeof pitch === 'undefined') return ''
	return `${getSign(pitch)}${pitch}%`
})

const pitchRangeDisplay = computed(() => {
	if (typeof pitchRange === 'undefined') return ''
	return `±${pitchRange}`
})
</script>

<template>
	<div class="absolute inset-0 items-center grid grid-rows-[1fr,auto,1fr] grid-cols-2 mt-4 mb-6">
		<div class="flex flex-col items-center col-span-2">
			<strong
				class="capitalize text-xl md:text-3xl font-black whitespace-pre-wrap text-center text-background select-none">
				<slot name="bpm">
					{{ bpmDisplay }}
				</slot>
			</strong>
			<p v-if="typeof bpm !== 'undefined' || slots.bpm" class="text-xs text-center text-background">BPM</p>
		</div>
		<div>
			<p
				:class="cn('capitalize text-xs md:text-base tracking-widest font-semibold tabular-nums text-center text-background leading-none select-none')">
				<slot v-if="typeof pitch !== 'undefined' || slots.pitch" name="pitch">
					{{ pitchDisplay }}
				</slot>
			</p>
		</div>
		<div>
			<p
				:class="cn('capitalize text-xs md:text-base tracking-widest font-semibold tabular-nums text-center text-background leading-none select-none')">
				<slot v-if="pitchRange || slots.pitchRange" name="pitchRange">
					{{ pitchRangeDisplay }}
				</slot>
			</p>
		</div>
		<div class="flex flex-col items-center col-span-2 mt-4">
			<strong
				:class="
					cn('capitalize text-sm md:text-lg font-semibold tabular-nums text-center text-background leading-none select-none')
				">
				<slot name="elapsedTime">
					{{ elapsedTimeDisplay }}
				</slot>
			</strong>
			<strong
				:class="
					cn('capitalize text-sm md:text-lg font-semibold tabular-nums text-center text-background leading-none select-none')
				">
				<slot name="remainingTime">
					{{ remainingTimeDisplay }}
				</slot>
			</strong>
		</div>
	</div>
</template>
