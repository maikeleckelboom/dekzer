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
const trackTempo = shallowRef<number | null>(null)
const trackWaveformData = shallowRef<WaveformData | null>(null)
const trackMetadata = shallowRef<IAudioMetadata | null>(null)

function clearState() {
	trackFile.value = null
	trackFileUrl.value = null
	trackWaveformData.value = null
	trackMetadata.value = null
	trackTempo.value = null
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
	clearState()
	nextTick(() => {
		const { files: [file] } = event.target as HTMLInputElement
		if (!file) return
		trackFile.value = file
		trackFileUrl.value = URL.createObjectURL(file)
	})
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

async function fetchWaveform(url: string, context: AudioContext): Promise<WaveformData> {
	const arrayBuffer = await fetchArrayBuffer(url)
	const options = {
		audio_context: context,
		array_buffer: arrayBuffer,
		scale: 128
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

async function getTempo(url: string, context: AudioContext, options = { minTempo: 60, maxTempo: 220 }) {
	const buffer = await getAudioBuffer(url, context)
	const { minTempo, maxTempo } = options
	return await analyze(buffer, { minTempo, maxTempo }) ?? null
}

whenever(logicAnd(audioContext, trackFile, trackFileUrl), async () => {
	const context = unref(audioContext)!
	const file = unref(trackFile)!
	const url = unref(trackFileUrl)!
	try {
		const [metadata, waveform, tempo] = await Promise.all([
			fetchMetadata(url, file),
			fetchWaveform(url, context),
			getTempo(url, context)
		])
		trackMetadata.value = metadata
		trackWaveformData.value = waveform
		trackTempo.value = tempo
	} catch (error) {
		console.error(error)
	}
})

const track = shallowRef<Partial<Track> | null>(null)

function getTrackPictureUrl(picture: IPicture[] | undefined): string | undefined {
	const cover = selectCover(picture)
	if (!cover) return
	return URL.createObjectURL(new Blob([cover.data], { type: cover.format, name: cover.name }))
}

function getTrackCommon(common): ICommonTagsResult {
	return {
		title: common.title,
		year: common.year,
		date: common.date,
		artists: common.artists,
		artist: common.artist,
		album: common.album,
		pictureUrl: getTrackPictureUrl(common.picture)
	}
}

function getTrackFormat(format: IFormat) {
	return {
		container: format.container,
		codec: format.codec,
		sampleRate: format.sampleRate,
		numberOfChannels: format.numberOfChannels,
		numberOfSamples: format.numberOfSamples,
		duration: format.duration,
		bitrate: format.bitrate
	}
}

function setTrackMetadata(metadata: IAudioMetadata) {
	track.value = {
		...getTrackCommon(metadata.common),
		format: getTrackFormat(metadata.format)
	}
}

whenever(trackMetadata, setTrackMetadata)


whenever(trackWaveformData, (waveform) => {
	console.log('waveformData', waveform)
})

whenever(trackTempo, (tempo) => {
	console.log('trackTempo', tempo)
})
</script>

<template>
	<div class="flex flex-col gap-4 mx-auto max-w-md my-12">
		<input
			accept="audio/*"
			type="file"
			@change="onFileChange"
		/>

		<Button @click="clearState">Clear</Button>


		<div v-if="track">
			<pre>{{ { track } }}</pre>
		</div>
		<div v-if="track?.pictureUrl">
			<img :src="track.pictureUrl" alt=""
					 class="w-full rounded object-cover object-center"
			/>
		</div>

		<div v-if="trackFileUrl" class="flex flex-col gap-4">
			<audio :src="trackFileUrl" controls />
			<div v-if="trackTempo">
				<pre>{{ { tempo: trackTempo } }}</pre>
			</div>
			<div v-if="trackMetadata">
				<pre>{{ { metadata: trackMetadata } }}</pre>
			</div>
			<div v-if="trackWaveformData">
				<pre>{{ { waveform: trackWaveformData } }}</pre>
			</div>
		</div>

	</div>
</template>
