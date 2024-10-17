<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'

interface TrackOverviewRootProps {
	track: Track
	currentTime: number
	playing: boolean
	disabled: boolean
}

const { track, currentTime, playing, disabled } = defineProps<Partial<TrackOverviewRootProps>>()

// const { play, pause, seek } = useTrackActions()
</script>

<template>
	<div class="min-w-36 w-full grid flex-grow">
		<slot>

		</slot>
	</div>
</template>