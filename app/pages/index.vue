<script lang="ts" setup>
useHead({
	title: 'Decks',
	meta: [
		{
			name: 'description',
			content: 'The new way to experience music.'
		}
	]
})

const { decks } = useDecks()
</script>

<template>
	<DecksPlatform>
		<Deck v-for="deck in decks" :key="deck.id" :deck="deck">
			<!--			<div class="flex flex-col gap-1 justify-center">-->
			<!--				<DeckPlaybackControls />-->
			<!--				<PitchRangeOptions />-->
			<!--			</div>-->
			<div class="border flex-grow">
				<TrackOverview />
			</div>
			<div class="border">
				<VirtualDeck />
			</div>
		</Deck>
	</DecksPlatform>
</template>
