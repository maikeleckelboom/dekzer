<script lang="ts" setup>
import Deck from '~~/layers/deck/components/Deck.vue'
import { parseWebStream } from 'music-metadata'
import { useTrackStore } from '~~/layers/track/stores/track'

useHead({
	title: 'Decks',
	meta: [
		{
			name: 'description',
			content: 'The new way to experience music.'
		}
	]
})

const deckStore = useDeckStore()
const { decks } = storeToRefs(deckStore)

const trackStore = useTrackStore()
const { tracks } = storeToRefs(trackStore)

async function onFileLoad(deck: IDeck, file: File) {
	const url = URL.createObjectURL(file)
	const response = await fetch(url, {
		headers: { 'ResponseType': 'stream' }
	})
	const metadata = await parseWebStream(response.body, {
		mimeType: file.type,
		size: file.size,
		url
	})
	const track = createTrack(url, metadata)
	trackStore.addTrack(track)
	deckStore.loadTrack(deck, track)
}


const trackACurrentTime = ref<number>(0)
const trackADuration = ref<number>()
const trackABpm = ref<number>()

watch(tracks, () => {
	console.log(tracks)
	const [trackA, trackB] = tracks.value
	if (trackA) {
		trackADuration.value = trackA.metadata.format.duration
		trackABpm.value = trackA.metadata.bpm
	}
}, { deep: true })
</script>

<template>
	<div class="grid md:grid-cols-2 divide-x border-y">
		<Deck
			v-for="deck in decks" :key="deck.id"
			@loadedTrack="onFileLoad(deck, $event)"
		>
			<div class="border flex-grow">
				<TrackOverview />
			</div>
			<div class="border">
				<VirtualDeck
					v-model:current-time="trackACurrentTime"
					:bpm="trackABpm"
					:duration="trackADuration"
				/>
			</div>
		</Deck>
	</div>
</template>
