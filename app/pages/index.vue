<script lang="ts" setup>
import WaveformData from 'waveform-data'
import { analyze } from 'web-audio-beat-detector'
import { Button } from '~~/layers/ui/components/button'
import { useAudioContext } from '~/composables/useAudioContext'
import { type IAudioMetadata, type IPicture, parseWebStream, selectCover } from 'music-metadata'
import type { Track } from '~~/layers/track/types'

definePageMeta({
	title: 'Dekzer'
})

const { audioContext } = useAudioContext()

const trackFile = shallowRef<File | null>(null)
const trackFileUrl = shallowRef<string | null>(null)
const trackWaveform = shallowRef<WaveformData | null>(null)
const trackMetadata = shallowRef<IAudioMetadata | null>(null)

const track = useState<Partial<Track> | null>('track', () => null)

function clearState() {
	trackFile.value = null
	trackFileUrl.value = null
	trackWaveform.value = null
	trackMetadata.value = null
	track.value = null
}

onUnmounted(() => {
	clearState()
	URL.revokeObjectURL(trackFileUrl.value)
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

async function getAudioBuffer(url: string, context: AudioContext): Promise<AudioBuffer> {
	const freshBuffer = await fetchArrayBuffer(url)
	return await context.decodeAudioData(freshBuffer)
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


function formatTrackMetadata({ common, format }: IAudioMetadata): Partial<Track> {
	const createPictureUrl = (pictures?: IPicture[]): string | undefined => {
		const cover = selectCover(pictures)
		return cover ? URL.createObjectURL(new Blob([cover.data], { type: cover.format })) : undefined
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
		track.value = { ...formatTrackMetadata(metadata), tempo: Math.round(tempo) }
		trackWaveform.value = waveform
	} catch (error) {
		console.error(error)
	}
})

const form = useTemplateRef<HTMLFormElement>()
const formReset = () => form.value?.reset()
onUnmounted(formReset)
onMounted(formReset)
</script>

<template>
	<div class="flex flex-col gap-4 m-8">

		<div class="grid grid-cols-2 gap-x-6 p-4 rounded bg-muted/50 border-2 items-center">
			<OldVirtualDeck :url="trackFileUrl" />
		</div>

		<VirtualDeck />

		<form ref="form" class="flex flex-col gap-4" @submit.prevent>
			<input
				v-if="!trackFile"
				accept="audio/*"
				type="file"
				@change="onFileChange"
			/>
			<Button type="reset" variant="outline" @click="clearState">Clear</Button>
		</form>
		<div class="grid md:grid-cols-2 gap-2">
			<div v-if="track?.pictureUrl" class="rounded relative overflow-clip max-w-full">
				<img :src="track.pictureUrl" alt="" class="size-full object-cover" />
			</div>
			<div v-if="track">
				<pre>{{ { track } }}</pre>
			</div>
		</div>
	</div>
</template>
