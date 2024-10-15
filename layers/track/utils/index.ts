import type { IAudioMetadata, IPicture } from 'music-metadata'
import { selectCover } from 'music-metadata'
import type { TrackMetadata } from '~~/layers/track/types'

function createTrackMetadata(metadata: IAudioMetadata): Partial<TrackMetadata> {
	const { common, format } = metadata

	function createPictureUrl(pictures?: IPicture[]): string | undefined {
		const cover = selectCover(pictures)
		return cover
			? URL.createObjectURL(new Blob([cover.data], { type: cover.format }))
			: undefined
	}

	return {
		title: common.title,
		year: common.year,
		date: common.date,
		bpm: common.bpm,
		key: common.key,
		artists: common.artists,
		artist: common.artist,
		album: common.album,
		genre: common.genre,
		lyrics: common.lyrics,
		producer: common.producer,
		composer: common.composer,
		pictureUrl: createPictureUrl(common.picture),
		format: {
			container: format.container,
			codec: format.codec,
			sampleRate: format.sampleRate,
			numberOfChannels: format.numberOfChannels,
			numberOfSamples: format.numberOfSamples,
			duration: format.duration,
			bitrate: format.bitrate,
			bitsPerSample: format.bitsPerSample,
			lossless: format.lossless
		}
	}
}