<script lang="ts" setup>
import WaveformData from 'waveform-data'
import { analyze } from 'web-audio-beat-detector'
import {
	type IAudioMetadata,
	type ICommonTagsResult,
	type IFormat,
	type IPicture,
	parseWebStream,
	selectCover
} from 'music-metadata'
import type { Track } from '~~/layers/track/types'
import { Button } from '~~/layers/ui/components/button'

definePageMeta({
	title: 'Dekzer'
})

const audioContext = shallowRef<AudioContext | null>(null)
const trackFile = shallowRef<File | null>(null)
const trackFileUrl = shallowRef<string | null>(null)
const trackWaveform = shallowRef<WaveformData | null>(null)
const trackMetadata = shallowRef<IAudioMetadata | null>(null)


function clearState() {
	trackFile.value = null
	trackFileUrl.value = null
	trackWaveform.value = null
	trackMetadata.value = null
	track.value = null
}

onMounted(() => {
	audioContext.value = new AudioContext()
})

onUnmounted(() => {
	URL.revokeObjectURL(trackFileUrl.value)
	clearState()
})


function onFileChange(event: Event) {
	const { files: [file] } = event.target as HTMLInputElement
	if (!file) return
	trackFile.value = file
	trackFileUrl.value = URL.createObjectURL(file)
}

async function fetchMetadata(url, file) {
	const response = await fetch(url, {
		headers: { 'ResponseType': 'stream' }
	})
	return await parseWebStream(response.body, {
		mimeType: file.type,
		size: file.size,
		url
	})
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
	const response = await fetch(url)
	return await response.arrayBuffer()
}

async function fetchWaveform(url: string, context: AudioContext, scale: number = 256): Promise<WaveformData> {
	const arrayBuffer = await fetchArrayBuffer(url)
	const options = {
		audio_context: context,
		array_buffer: arrayBuffer,
		scale
	}
	return new Promise((resolve, reject) => {
		WaveformData.createFromAudio(options, (err, waveform) => {
			err ? reject(err) : resolve(waveform)
		})
	})
}

async function getAudioBuffer(url: string, context: AudioContext): Promise<AudioBuffer> {
	const freshBuffer = await fetchArrayBuffer(url)
	return await context.decodeAudioData(freshBuffer)
}

const track = shallowRef<Partial<Track> | null>(null)

function formatTrackMetadata(metadata: IAudioMetadata): Partial<Track> {
	const getTrackPictureUrl = (picture: IPicture[] | undefined): string | undefined => {
		const cover = selectCover(picture)
		if (!cover) return
		return URL.createObjectURL(new Blob([cover.data], { type: cover.format, name: cover.name }))
	}
	const getTrackCommon = (common: ICommonTagsResult): Omit<Track, 'format'> => ({
		title: common.title,
		year: common.year,
		date: common.date,
		artists: common.artists,
		artist: common.artist,
		album: common.album,
		pictureUrl: getTrackPictureUrl(common.picture)
	})
	const getTrackFormat = (format: IFormat): Track['format'] => ({
		container: format.container,
		codec: format.codec,
		sampleRate: format.sampleRate,
		numberOfChannels: format.numberOfChannels,
		numberOfSamples: format.numberOfSamples,
		duration: format.duration,
		bitrate: format.bitrate,
		bitsPerSample: format.bitsPerSample,
		lossless: format.lossless
	})
	return {
		...getTrackCommon(metadata.common),
		format: getTrackFormat(metadata.format)
	}
}

async function getTempo(url: string, context: AudioContext, options = { minTempo: 60, maxTempo: 220 }) {
	const buffer = await getAudioBuffer(url, context)
	const { minTempo, maxTempo } = options
	return await analyze(buffer, { minTempo, maxTempo }) ?? null
}

whenever(logicAnd(audioContext, trackFile, trackFileUrl), async () => {
	const context = unref(audioContext)!
	const file = unref(trackFile)!
	const url = unref(trackFileUrl)!

	async function analyzeTrack(): Promise<{
		metadata: IAudioMetadata,
		tempo: number | null,
		waveform: WaveformData
	}> {
		const [metadata, tempo, waveform] = await Promise.all([
			fetchMetadata(url, file),
			getTempo(url, context),
			fetchWaveform(url, context)
		])
		return { metadata, tempo, waveform }
	}

	try {
		const { metadata, tempo, waveform } = await analyzeTrack()
		track.value = { ...formatTrackMetadata(metadata), tempo }
		trackWaveform.value = waveform
	} catch (error) {
		console.error(error)
	}
})
</script>

<template>
	<div class="flex flex-col gap-4 mx-auto max-w-md my-12">

		<div v-if="trackFileUrl">
			<VirtualDeck :url="trackFileUrl" :tempo="track?.tempo"/>
		</div>

		<form class="flex flex-col gap-4" @submit.prevent>
			<input
				v-if="!trackFile"
				accept="audio/*"
				type="file"
				@change="onFileChange"
			/>
			<Button type="reset" variant="outline" @click="clearState">Clear</Button>
		</form>
		<div v-if="trackFileUrl" class="flex flex-col gap-4">
			<audio :src="trackFileUrl" controls />
		</div>
		<div v-if="track?.pictureUrl">
			<img :src="track.pictureUrl" alt="" class="w-full rounded object-cover object-center" />
		</div>
		<div v-if="track">
			<pre>{{ { track } }}</pre>
		</div>
	</div>
</template>
