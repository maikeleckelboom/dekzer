import type { ILyricsTag } from 'music-metadata'

export interface Track {
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
	format: TrackFormat
	tempo: number
	tags: string[]
	releaseDate: string
	lyrics: ILyricsTag[]
	// ...
	composer: string
	producer: string

}

export interface TrackFormat {
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
