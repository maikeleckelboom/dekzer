<script lang="ts" setup>
import {
	injectVirtualDeckRootContext,
	type VirtualDeckRootContext
} from '~~/layers/virtual-deck/components/VirtualDeckRoot.vue'

const { currentTime, duration, pitch, pitchRange, bpm } = injectVirtualDeckRootContext() as VirtualDeckRootContext

const elapsedTimeDisplay = computed(() => {
	return typeof currentTime.value !== 'undefined' ? formatSeconds(currentTime.value) : ''
})

const remainingTimeDisplay = computed(() => {
	return duration.value ? formatSeconds(duration.value - currentTime.value) : ''
})

const bpmDisplay = computed(() => {
	const tempo = unref(bpm)
	if (typeof tempo === 'undefined') return ''
	const isRound = tempo % 1 === 0
	return isRound ? tempo.toString() : tempo.toFixed(2)
})

const getSign = (value: number): string => value >= 0 ? '+' : ''
const pitchDisplay = computed(() => {
	if (typeof pitch.value === 'undefined') return ''
	return `${getSign(pitch.value)}${pitch.value}%`
})

const pitchRangeDisplay = computed(() => {
	if (typeof pitchRange.value === 'undefined') return ''
	return `±${pitchRange.value}`
})
</script>

<template>
	<div class="absolute inset-0 items-center grid grid-rows-[1fr,auto,1fr] grid-cols-2 mt-4 mb-6">
		<div class="flex flex-col items-center col-span-2">
			<template v-if="bpm">
				<strong
					class="capitalize text-xl md:text-3xl font-black whitespace-pre-wrap text-center text-background select-none">
					{{ bpmDisplay }}
				</strong>
				<p class="text-xs text-center text-background">BPM</p>
			</template>
		</div>
		<div>
			<template v-if="pitchDisplay">
				<p
					:class="cn('capitalize text-xs md:text-base tracking-widest font-semibold tabular-nums text-center text-background leading-none select-none')">
					{{ pitchDisplay }}
				</p>
			</template>
		</div>
		<div>
			<template v-if="pitchRange">
				<p
					:class="cn('capitalize text-xs md:text-base tracking-widest font-semibold tabular-nums text-center text-background leading-none select-none')">
					{{ pitchRangeDisplay }}
				</p>
			</template>
		</div>
		<template v-if="typeof currentTime !== 'undefined' && typeof duration !== 'undefined'">
			<div class="flex flex-col items-center col-span-2 mt-4">
				<strong
					:class="
					cn('capitalize text-sm md:text-lg md:leading-none font-semibold tabular-nums text-center text-background leading-none select-none')
				">
					{{ elapsedTimeDisplay }}
				</strong>
				<strong
					:class="
					cn('capitalize text-sm md:text-lg md:leading-none font-semibold tabular-nums text-center text-background leading-none select-none')
				">
					<slot name="remainingTime">
						{{ remainingTimeDisplay }}
					</slot>
				</strong>
			</div>
		</template>
	</div>
</template>
