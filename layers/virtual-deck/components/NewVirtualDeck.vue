<script lang="ts" setup>
import { VirtualDeck, VirtualDeckStylus } from '#components'

const deck = useTemplateRef<InstanceType<typeof VirtualDeck>>('deck')
const stylus = useTemplateRef<InstanceType<typeof VirtualDeckStylus>>('stylus')

const currentTime = ref(40.33)
const duration = ref(120.0)

const { isInteracting, progress, angle } = useVirtualDeck(deck, stylus, currentTime, duration)

</script>

<template>
	<VirtualDeckRoot ref="deck">
		<VirtualDeckProgressCircle :progress="progress"/>
		<VirtualDeckPlatter>
			<VirtualDeckStylus ref="stylus" :initial-angle="angle"/>
		</VirtualDeckPlatter>
		<VirtualDeckSurface />
	</VirtualDeckRoot>
</template>

<style scoped>

</style>