<script lang="ts" setup>
import { type IAudioMetadata, parseWebStream } from 'music-metadata'
import WaveformData from 'waveform-data'

definePageMeta({
	title: 'Dekzer'
})

const uploadedFile = shallowRef<File | null>(null)
const uploadedFileUrl = shallowRef<string | null>(null)

function onFileChange(event: Event) {
	const { files: [file] } = event.target as HTMLInputElement
	if (!file) return
	uploadedFile.value = file
	uploadedFileUrl.value = URL.createObjectURL(file)
}

const musicMetadata = shallowRef<IAudioMetadata | null>(null)

async function fetchMetadata(url, file) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'ResponseType': 'stream'
		}
	})

	return await parseWebStream(response.body, {
		mimeType: file.type,
		size: file.size,
		url
	})
}

const audioContext = shallowRef<AudioContext | null>(null)
const waveformData = shallowRef<WaveformData | null>(null)

async function fetchWaveform(url, file) {
	audioContext.value ??= new AudioContext()
	const context = unref(audioContext)!

	const response = await fetch(url)
	const buffer = await response.arrayBuffer()
	const options = {
		audio_context: context,
		array_buffer: buffer,
		scale: 128
	}
	return new Promise((resolve, reject) => {
		WaveformData.createFromAudio(options, (err, waveform) => {
			if (err) {
				reject(err)
			} else {
				resolve(waveform)
			}
		})
	})
}

whenever(logicAnd(uploadedFile, uploadedFileUrl), async () => {
	const file = unref(uploadedFile)!
	const url = unref(uploadedFileUrl)!

	try {
		musicMetadata.value = await fetchMetadata(url, file)
		waveformData.value = await fetchWaveform(url, file)

	} catch (error) {
		console.error(error)
	}
})

whenever(musicMetadata, (metadata) => {
	console.log('uploadedFileMetadata', metadata)
})

whenever(waveformData, (waveform) => {
	console.log('waveformData', waveform)
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
