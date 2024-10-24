import type { ICommonTagsResult, IFormat } from 'music-metadata'

export interface Track {
  id: string
  url: string
  pictureUrl: string | undefined
  common: Omit<ICommonTagsResult, 'movementIndex' | 'picture'>
  format: Omit<IFormat, 'tagTypes'>
}
