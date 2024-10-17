<script lang="ts" setup>
import Deck from '~/components/Deck.vue'
import { useDeckStore } from '~~/layers/deck/stores/deck'
import { useTrackStore } from '~~/layers/track/stores/track'

useHead({
	title: 'Decks',
	meta: [
		{
			name: 'description',
			content: 'A new way to experience music.'
		}
	]
})

const deckStore = useDeckStore()
const { decks } = storeToRefs(deckStore)

const trackStore = useTrackStore()
const { tracks } = storeToRefs(trackStore)
</script>

<template>
	<div class="grid md:grid-cols-2 md:divide-x">
		<Deck :deck="deck" v-for="deck in decks" :key="deck.id" />
	</div>
</template>
