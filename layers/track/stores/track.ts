import type { Track } from '~~/layers/track/types'
import {
  type IAudioMetadata,
  ICommonTagsResult,
  IFormat,
  type IPicture,
  selectCover
} from 'music-metadata'

function createPictureUrl(pictures?: IPicture[]): string | undefined {
  const cover = selectCover(pictures)
  return cover ? URL.createObjectURL(new Blob([cover.data], { type: cover.format })) : undefined
}

export const useTrackStore = defineStore('tracks.store', () => {
  const tracks = useState<Track[]>('tracks', () => [])

  return {
    tracks,
    createTrack(url: string, metadata: IAudioMetadata) {
      const { quality: _, native: __, common, format } = metadata
      const { movementIndex, picture, ...restCommon } = common as Omit<
        ICommonTagsResult,
        'movementIndex' | 'picture'
      >
      const { tagTypes, ...restFormat } = format as Omit<IFormat, 'tagTypes'>
      const pictureUrl = createPictureUrl(picture)
      return {
        id: nanoid(),
        url,
        pictureUrl,
        common: restCommon,
        format: restFormat
      }
    },
    getTrackById(id: string) {
      return tracks.value.find((track) => track?.id === id)
    },
    addTrack(track: Track) {
      if (
        tracks.value.some((t) => t.id === track.id) ||
        !tracks.value.some((t) => t.url === track.url)
      ) {
        return
      }
      tracks.value.unshift(track)
    },
    removeTrack(track: Track) {
      tracks.value.splice(tracks.value.indexOf(track), 1)
    }
  }
})
