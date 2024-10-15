<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import { useTrackStore } from '~~/layers/track/stores/track'
import { type IDeck, useDeckStore } from '~~/layers/deck/stores/deck'

interface DeckProps extends DeckRootProps {
	deck: IDeck
}

const { deck } = defineProps<DeckProps>()

const store = useDeckStore()

const currentTime = ref<number>(0)
const pitchRange = ref<8 | 16 | 50>(8)
const pitch = ref<number>(0)


const trackStore = useTrackStore()
const loadedTrack = computedEager(() => trackStore.getTrackById(deck?.track?.id))


async function onTrackLoad(file: File) {
	const url = URL.createObjectURL(file)
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const metadata = await parseWebStream(response.body, { mimeType: file.type, size: file.size, url })
	const track = trackStore.createTrack(url, metadata)
	trackStore.addTrack(track)
	store.loadTrack(deck, track)
}

</script>

<template>
	<DeckRoot :selectTrackEvent="selectTrackEvent" @trackLoaded="onTrackLoad">
		<div class="border flex-grow">
			<TrackOverview />
		</div>
		<div class="border">
			<VirtualDeck
				v-model:currentTime="currentTime"
				:bpm="loadedTrack?.common?.bpm"
				:duration="loadedTrack?.format?.duration"
				:pitch="pitch"
				:pitchRange="pitchRange"

			/>
		</div>
	</DeckRoot>
</template>