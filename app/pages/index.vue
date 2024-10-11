<script lang="ts" setup>
import WaveformData from 'waveform-data'
import { analyze } from 'web-audio-beat-detector'
import { type IAudioMetadata, parseWebStream } from 'music-metadata'

definePageMeta({
	title: 'Dekzer'
})

const audioContext = shallowRef<AudioContext | null>(null)

onMounted(() => {
	audioContext.value = new AudioContext()
})
const trackFile = shallowRef<File | null>(null)
const trackUrl = shallowRef<string | null>(null)

const trackTempo = ref<number | null>(null)
const trackMetadata = shallowRef<IAudioMetadata | null>(null)
const trackWaveformData = shallowRef<WaveformData | null>(null)

function clearState() {
	trackFile.value = null
	trackUrl.value = null
	trackWaveformData.value = null
	trackMetadata.value = null
	trackTempo.value = null
}

function onFileChange(event: Event) {
	clearState()
	nextTick(() => {
		const { files: [file] } = event.target as HTMLInputElement
		if (!file) return
		trackFile.value = file
		trackUrl.value = URL.createObjectURL(file)
	})
}

onUnmounted(() => {
	URL.revokeObjectURL(trackUrl.value)
})

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

async function fetchBuffer(url: string): Promise<ArrayBuffer> {
	const response = await fetch(url)
	return await response.arrayBuffer()
}

async function fetchWaveform(url: string, context: AudioContext): Promise<WaveformData> {
	const arrayBuffer = await fetchBuffer(url)
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
	const freshBuffer = await fetchBuffer(url)
	return await context.decodeAudioData(freshBuffer)
}

async function getTempo(url: string, context: AudioContext, options = { minTempo: 150, maxTempo: 240 }) {
	const buffer = await getAudioBuffer(url, context)
	const { minTempo, maxTempo } = options
	return await analyze(buffer, { minTempo, maxTempo })
}

whenever(logicAnd(audioContext, trackFile, trackUrl), async () => {
	const context = unref(audioContext)!
	const file = unref(trackFile)!
	const url = unref(trackUrl)!

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

const coverSrc = computed(() => {
	const picture = trackMetadata.value?.common.picture
	if (picture && picture.length) {
		console.log('picture', picture)
		const blob = new Blob([picture[0].data], { type: picture[0].format })

		return URL.createObjectURL(blob)
	}
	return ''
})

whenever(trackMetadata, (metadata) => {
	console.log('trackMetadata', metadata)
})

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

		<div v-if="coverSrc">
			<img :src="coverSrc" />
		</div>

		<div v-if="trackUrl" class="flex flex-col gap-4">
			<audio :src="trackUrl" controls />
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
