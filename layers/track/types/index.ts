import type { IAudioMetadata, ILyricsTag } from 'music-metadata'

export interface TrackMetadata {
	title: string
	genre: string[]
	artists: string[]
	bpm: number
	key: string
	artist: string
	album: string
	year: number
	date: string
	pictureUrl: string
	format: TrackMetadataFormat
	lyrics: ILyricsTag[]
	composer: string
	producer: string
}

export interface TrackMetadataFormat {
	container: string
	codec: string
	sampleRate: number
	numberOfChannels: number
	numberOfSamples: number
	duration: number
	bitrate: number
	bitsPerSample: number
	lossless: boolean
}

export type Track = {
	id: string
	url: string
	metadata: TrackMetadata
}


// mew"
export type Track2 = {
	id: string
	url: string
	metadata: IAudioMetadata
}