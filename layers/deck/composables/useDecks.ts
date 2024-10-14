import type { Track } from '~~/layers/track/types'

interface ChannelStripControls {
	gain: number;
	volume: number;
	pan: number;
	pitch: number;
	tempo: number;
	high: number;
	mid: number;
	low: number;
}

interface PlaybackContext {
	currentTime: number
	duration: number
	playing: boolean
}

interface Deck {
	id: string
	name: string
	channelStrip: ChannelStripControls[]
	loadedTrack?: Track
	playback?: PlaybackContext
}

interface UseDeckReturn {
	decks: Ref<Deck[]>
	addDeck: (deck: Deck) => void
	removeDeck: (deck: Deck) => void
}

export const useDecks = createSharedComposable((): UseDeckReturn => {
	const decks = useState<Deck[]>('decks', () => [
		{ id: '1', name: 'Deck 1' },
		{ id: '2', name: 'Deck 2' }
	])

	function addDeck(deck: Omit<Deck, 'position'>) {
		if (decks.value.some(d => d.id === deck.id)) return
		decks.value.push({
			...deck,
			position: ++decks.value.length
		})
	}

	function removeDeck(deck: Deck) {
		const index = decks.value.findIndex(d => d.id === deck.id)
		if (index === -1) return
		decks.value.splice(index, 1)
	}

	function loadTrack(deck: Deck, track: Track) {
		deck.loadedTrack = track
	}

	function unloadTrack(deck: Deck) {
		deck.loadedTrack = undefined
	}

	return {
		decks,
		addDeck,
		removeDeck,
		loadTrack,
		unloadTrack
	}
})

export type { Deck, ChannelStripControls }