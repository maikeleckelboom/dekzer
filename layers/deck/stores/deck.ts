import type { Track } from '~~/layers/track/types'

export interface Deck {
  id: number
  index: number
  name: string
  track: Track | null
}

export const useDeckStore = defineStore('deck.store', () => {
  const decks = useState<Deck[]>('decks', () => [
    {
      id: 1,
      index: 1,
      name: 'Deck 1',
      track: null
    },
    {
      id: 2,
      index: 2,
      name: 'Deck 2',
      track: null
    }
  ])

  const tracks = computed(() =>
    decks.value.filter((deck) => deck.track).map((deck) => deck.track)
  )

  function getTrackByById(id: string | undefined): Track | undefined {
    if (typeof id === 'undefined') return
    const found = tracks.value.find((track) => track?.id === id)
    return found || undefined
  }

  function load(deck: Deck, track: Track): void {
    const index = decks.value.findIndex((d) => d.id === deck.id)
    if (index === -1) return
    decks.value.at(index)!.track = track
  }

  function eject(deck: Deck): void {
    const index = decks.value.findIndex((d) => d.id === deck.id)
    if (index === -1) return
    decks.value.at(index)!.track = null
  }

  const computedTrack = (deck: Deck) => computed(() => getTrackByById(deck.track?.id))

  return {
    decks,
    tracks,
    getTrackByById,
    computedTrack,
    load,
    eject
  }
})
