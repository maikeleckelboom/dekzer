export interface TrackFormat {
	container: string
	codec: string
	sampleRate: number
	numberOfChannels: number
	numberOfSamples: number
	duration: number
	bitrate: number
}

export interface Track {
	title: string
	year: number
	date: string
	artists: string[]
	artist: string
	album: string
	pictureUrl: string
	format: TrackFormat
}