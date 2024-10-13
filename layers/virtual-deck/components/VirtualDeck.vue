<script lang="ts" setup>
import { VirtualDeck, VirtualDeckAudioInput, VirtualDeckStylus, VirtualDeckTrackPanel } from '#components'

const deck = useTemplateRef<InstanceType<typeof VirtualDeck>>('deck')
const stylus = useTemplateRef<InstanceType<typeof VirtualDeckStylus>>('stylus')

interface VirtualDeckProps {
	currentTime: number
	duration: number
	bpm: number
	pitch: number
	pitchRange: number
}

const {
	duration = 200.7,
	bpm = 0,
	pitchRange = 8
} = defineProps<VirtualDeckProps>()

const currentTime = defineModel<VirtualDeckProps['currentTime']>('virtualDeckCurrentTime', {
	default: 0
})

const pitch = defineModel<VirtualDeckProps['pitch']>('virtualDeckPitch', {
	default: 0
})

const { isInteracting, progress, angle } = useVirtualDeck(deck, stylus, currentTime, duration)
</script>

<template>
	<VirtualDeckRoot ref="deck">
		<VirtualDeckProgressCircle :progress="progress" />
		<VirtualDeckPlatter>
			<VirtualDeckStylus ref="stylus" :initial-angle="angle" />
		</VirtualDeckPlatter>
		<VirtualDeckAudioInput>
			<VirtualDeckTrackPanel
				:bpm="bpm"
				:current-time="currentTime"
				:duration="duration"
				:pitch="pitch"
				:pitch-range="pitchRange"
			/>
		</VirtualDeckAudioInput>
	</VirtualDeckRoot>
</template>