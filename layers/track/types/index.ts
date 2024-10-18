import type { IAudioMetadata } from 'music-metadata'

export interface Track extends IAudioMetadata {
  id: string
  url: string
  pictureUrl: string
}
