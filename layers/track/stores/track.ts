import type { Track } from '~~/layers/track/types'

export const useTrackStore = defineStore('tracks.store', () => {
	const tracks = useState<Track[]>('tracks', () => [])

	return {
		tracks,
		getTrackById(id: string) {
			return tracks.value.find((track) => track?.id === id)
		},
		addTrack(track: Track) {
			tracks.value.unshift(track)
		},
		removeTrack(track: Track) {
			tracks.value.splice(tracks.value.indexOf(track), 1)
		}
	}
})
