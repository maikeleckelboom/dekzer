import type { Track } from '~~/layers/track/types'

export interface IDeck {
  id: string
  name: string
  index: number
  track: Track | null
}

export const useDeckStore = defineStore('deck.store', () => {
  const decks = useState<IDeck[]>('decks', () => [
    {
      id: 'Deck 1',
      name: 'Deck 1',
      index: 1,
      track: null
    },
    {
      id: 'Deck 2',
      name: 'Deck 2',
      index: 2,
      track: null
    }
  ])

  const loadedTracks = computed(() =>
    decks.value.filter((deck) => deck.track).map((deck) => deck.track)
  )

  function getTrackByById(id: string | undefined): Track | undefined {
    if (typeof id === 'undefined') return
    return loadedTracks.value.find((track) => track?.id === id)
  }

  function load(deck: IDeck, track: Track): void {
    const index = decks.value.findIndex((d) => d.id === deck.id)
    if (index === -1) return
    decks.value[index].track = track
  }

  function eject(deck: IDeck): void {
    const index = decks.value.findIndex((d) => d.id === deck.id)
    if (index === -1) return
    decks.value[index].track = null
  }

  return {
    decks,
    loadedTracks,
    load,
    eject,
    computedTrack: (deck: IDeck) => computed(() => getTrackByById(deck.track?.id))
  }
})
