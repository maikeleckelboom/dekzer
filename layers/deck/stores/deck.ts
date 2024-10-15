import type { Track } from '~~/layers/track/types'

export interface IDeck {
	id: string
	name: string
	track: Track | null
}

export const useDeckStore = defineStore('deck.store', () => {
	const decks = useState<IDeck[]>('decks', () => [
		{
			id: 'Deck 1',
			name: 'Deck 1'
		},
		{
			id: 'Deck 2',
			name: 'Deck 2'
		}
	])

	function addDeck(deck: IDeck): void {
		if (decks.value.some(d => d.id === deck.id)) return
		decks.value.push({
			...deck
		})
	}

	function removeDeck(deck: IDeck): void {
		const index = decks.value.findIndex(d => d.id === deck.id)
		if (index === -1) return
		decks.value.splice(index, 1)
	}

	function loadTrack(deck: IDeck, track: Track): void {
		const index = decks.value.findIndex(d => d.id === deck.id)
		if (index === -1) return
		decks.value[index].track = track
	}

	function unloadTrack(deck: IDeck): void {
		const index = decks.value.findIndex(d => d.id === deck.id)
		if (index === -1) return
		decks.value[index].track = undefined
	}

	function getDeckById(id: string): IDeck | undefined {
		return decks.value.find(deck => deck.id === id)
	}

	const loadedTracks = computed(() => decks.value.filter(deck => deck.track).map(deck => deck.track))

	function getTrackByById(id: string): Track | undefined {
		return loadedTracks.value.find(track => track.id === id)
	}

	function computedTrack(deck: IDeck) {
		return computed(() => getTrackByDeckId(deck.id))
	}

	return {
		decks,
		loadedTracks,
		addDeck,
		removeDeck,
		getDeckById,
		getTrackByById,
		loadTrack,
		unloadTrack,
		computedTrack
	}
})
