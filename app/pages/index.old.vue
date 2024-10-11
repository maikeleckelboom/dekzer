<script lang="ts" setup>
import { type IAudioMetadata, parseWebStream } from 'music-metadata'
import WaveformData from 'waveform-data'
import { analyze } from 'web-audio-beat-detector'

definePageMeta({
	title: 'Dekzer'
})

const audioContext = shallowRef<AudioContext | null>(null)

onMounted(() => {
	audioContext.value = new AudioContext()
})


// const trackArrayBuffer = shallowRef<ArrayBuffer | null>(null)
// const audioBuffer = shallowRef<AudioBuffer | null>(null)
const trackTempo = ref<number | null>(null)
const trackMetadata = shallowRef<IAudioMetadata | null>(null)
const trackWaveformData = shallowRef<WaveformData | null>(null)


const uploadedFile = shallowRef<File | null>(null)
const uploadedFileUrl = shallowRef<string | null>(null)

async function clearState() {
	uploadedFile.value = null
	uploadedFileUrl.value = null
	trackWaveformData.value = null
	trackMetadata.value = null
	trackTempo.value = null
	await nextTick()
}

 function onFileChange(event: Event) {
	clearState()
	const { files: [file] } = event.target as HTMLInputElement
	if (!file) return
	uploadedFile.value = file
	uploadedFileUrl.value = URL.createObjectURL(file)
}

onUnmounted(() => {
	URL.revokeObjectURL(uploadedFileUrl.value)
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

async function getAudioBuffer() {
	const context = unref(audioContext)!
	const freshBuffer = await fetchBuffer(uploadedFileUrl.value!)
	return await context.decodeAudioData(freshBuffer)
}

async function getTempo(options = { minTempo: 80, maxTempo: 240 }) {
	const buffer = await getAudioBuffer()
	const { minTempo, maxTempo } = options
	return await analyze(buffer, { minTempo, maxTempo })
}

whenever(logicAnd(uploadedFile, uploadedFileUrl), async () => {
	const file = unref(uploadedFile)!
	const url = unref(uploadedFileUrl)!
	const context = unref(audioContext)!
	try {
		trackMetadata.value = await fetchMetadata(url, file)
		trackWaveformData.value = await fetchWaveform(url, context)
		trackTempo.value = await getTempo()
	} catch (error) {
		console.error(error)
	}
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


	</div>
</template>
