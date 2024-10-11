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


const audioArrayBuffer = shallowRef<ArrayBuffer | null>(null)
const audioBuffer = shallowRef<AudioBuffer | null>(null)
const audioBufferTempo = ref<number | null>(null)
const musicMetadata = shallowRef<IAudioMetadata | null>(null)
const waveformData = shallowRef<WaveformData | null>(null)

whenever(audioBuffer, async (buffer) => {
	console.log('audioBuffer', buffer)
	audioBufferTempo.value = await analyze(buffer, { maxTempo: 220, minTempo: 90 })
})

const uploadedFile = shallowRef<File | null>(null)
const uploadedFileUrl = shallowRef<string | null>(null)

function clearState() {
	uploadedFile.value = null
	uploadedFileUrl.value = null
	audioArrayBuffer.value = null
	audioBuffer.value = null
	waveformData.value = null
	musicMetadata.value = null
	audioBufferTempo.value = null
}

function onFileChange(event: Event) {
	clearState()
	nextTick(() => {
		const { files: [file] } = event.target as HTMLInputElement
		if (!file) return
		uploadedFile.value = file
		uploadedFileUrl.value = URL.createObjectURL(file)
	})
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
	const arrayBuffer = unref(audioArrayBuffer)!
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

whenever(logicAnd(uploadedFile, uploadedFileUrl), async () => {
	const file = unref(uploadedFile)!
	const url = unref(uploadedFileUrl)!
	const context = unref(audioContext)!
	try {
		audioArrayBuffer.value = await fetchBuffer(url)
		musicMetadata.value = await fetchMetadata(url, file)
		waveformData.value = await fetchWaveform(url, context)
	} catch (error) {
		console.error(error)
	}
})

async function decodeAudio(arrayBuffer): Promise<AudioBuffer | null> {
	const context = audioContext.value
	if (!context) return null
	return await context.decodeAudioData(arrayBuffer)
}

whenever(audioArrayBuffer, async (arrayBuffer) => {
	console.log('arrayBuffer', arrayBuffer)
	const context = unref(audioContext)!
	const freshBuffer = await fetchBuffer(uploadedFileUrl.value!)
	audioBuffer.value = await context.decodeAudioData(freshBuffer)


})

function playBuffer(buffer: AudioBuffer) {
	// const context = unref(audioContext)!
	// const source = context.createBufferSource()
	// source.buffer = buffer
	// source.connect(context.destination)
	// source.start()
}

function stopBuffer() {
	const context = unref(audioContext)!
	context.suspend()
}


whenever(musicMetadata, (metadata) => {
	console.log('uploadedFileMetadata', metadata)
})

whenever(waveformData, (waveform) => {
	console.log('waveformData', waveform)
})

whenever(audioBufferTempo, (tempo) => {
	console.log('audioBufferTempo', tempo)

	playBuffer(audioBuffer.value)
})
</script>

<template>
	<div class="flex flex-col gap-4 mx-auto max-w-md my-12">
		<input
			accept="audio/*"
			type="file"
			@change="onFileChange"
		/>
		<button @click="clearState">Clear</button>
		<button
			:disabled="!audioBuffer"
			@click="playBuffer(audioBuffer)"
		>
			<Icon class="size-8" name="streamline:button-play-solid" />
		</button>
		<button
			:disabled="!audioBuffer"
			@click="stopBuffer"
		>
			<Icon class="size-8" name="streamline:button-stop-solid" />
		</button>

	</div>
</template>
