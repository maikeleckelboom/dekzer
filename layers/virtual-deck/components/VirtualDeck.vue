<script lang="ts" setup>
import { VirtualDeckPlatter, VirtualDeckProgress, VirtualDeckStylus, VirtualDeckTrackPanel } from '#components'

interface VirtualDeckProps {
	currentTime: number
	duration: number
	pitch: number
	pitchRange: number
}

const props = defineProps<Partial<VirtualDeckProps>>()

const currentTime = ref(props.currentTime ?? 0)
const duration = ref(props.duration ?? 10)
const pitch = ref(props.pitch ?? 0)
const pitchRange = ref(props.pitchRange ?? 8)
</script>

<template>
	<VirtualDeckRoot
		v-model:current-time="currentTime"
		:duration="duration"
		:pitch="pitch"
		:pitch-range="pitchRange"
	>
		<VirtualDeckProgress />
		<VirtualDeckPlatter>
			<VirtualDeckStylus />
		</VirtualDeckPlatter>
		<VirtualDeckTrackPanel />
	</VirtualDeckRoot>
</template>