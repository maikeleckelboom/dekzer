<script lang="ts" setup>
import { VirtualDeck, VirtualDeckPlatter, VirtualDeckStylus, VirtualDeckTrackPanel } from '#components'

interface VirtualDeckProps {
	currentTime: number
	duration: number
	bpm: number
	pitch: number
	pitchRange: 8 | 16 | 50
}

type CurrentTime = VirtualDeckProps['currentTime']
type Pitch = VirtualDeckProps['pitch']

const { duration } = defineProps<Partial<VirtualDeckProps>>()

const currentTime = defineModel<CurrentTime>('currentTime', { default: 0 })
const pitch = defineModel<Pitch>('pitch', { default: 0 })

const deck = useTemplateRef<InstanceType<typeof VirtualDeck>>('deck')
const stylus = useTemplateRef<InstanceType<typeof VirtualDeckStylus>>('stylus')

const { isInteracting, progress, angle } = useVirtualDeck(deck, stylus, currentTime, duration)
</script>

<template>
	<VirtualDeckRoot ref="deck">
		<VirtualDeckProgressCircle :progress="progress" />
		<VirtualDeckPlatter>
			<VirtualDeckStylus ref="stylus" :initial-angle="angle" />
		</VirtualDeckPlatter>
		<VirtualDeckTrackPanel />
	</VirtualDeckRoot>
</template>