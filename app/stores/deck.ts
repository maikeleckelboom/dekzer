import { nanoid } from 'nanoid'
import type { Track } from '~~/layers/track/types'

export interface IDeck {
	id: string
	name: string
	track: Track|null
}

export const useDeckStore = defineStore('deck.store', () => {
	const decks = useState<IDeck[]>('decks', () => [
		{
			id: 'Deck 1',
			name: 'Deck 1',
			track: null
		},
		// {
		// 	id: 'Deck 2',
		// 	name: 'Deck 2',
		// 	track: null
		// }
	])

	function addDeck(deck: IDeck): void {
		if (decks.value.some(d => d.id === deck.id)) return
		decks.value.push({
			...deck,
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

	return {
		decks,
		addDeck,
		removeDeck,
		loadTrack,
		unloadTrack
	}
})
