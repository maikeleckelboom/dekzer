<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'

interface TrackOverviewRootProps {
	track: Track | null
	currentTime: number
	playing: boolean
	disabled: boolean
}

const {
	track = null,
	playing = false,
	disabled = false
} = defineProps<Partial<TrackOverviewRootProps>>()

const currentTime = defineModel<number>('currentTime', { type: Number, default: 0 })
</script>

<template>
	<div class="min-w-16 w-full grid flex-grow">
		<slot>

		</slot>
	</div>
</template>