<script lang="ts" setup>
import { VirtualDeck, VirtualDeckStylus } from '#components'

const { url } = defineProps<{
	url?: string
}>()


const { audioContext, initializeContext } = useAudioContext()


watch(() => url, async (newValue, oldValue) => {
	if (oldValue && !newValue) {
		resetState()
		return
	}

	if (import.meta.client && navigator.userActivation.hasBeenActive) {
		const context = initializeContext()
		const buffer = await initializeAudioBuffer(context, url)
		const source = initializeSourceNode(context, buffer)
	}
})

const audioBuffer = shallowRef<AudioBuffer>()
const sourceNode = shallowRef<AudioBufferSourceNode>()

const currentTime = ref<number>(0)
const duration = ref<number>(0)
const playing = ref<boolean>(false)

async function fetchAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const response = await fetch(url, {
		headers: { 'ResponseType': 'stream' }
	})
	const arrayBuffer = await response.arrayBuffer()
	return await context.decodeAudioData(arrayBuffer)
}

async function initializeAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const buffer = await fetchAudioBuffer(context, url)
	audioBuffer.value = buffer
	duration.value = buffer.duration
	return buffer
}

const startTime = ref<number>(0)
const startOffset = ref<number>(0)


let rAF: number | null = null

function resetState() {
	if (rAF !== null) {
		cancelAnimationFrame(rAF)
	}
	duration.value = 0
	currentTime.value = 0
	startOffset.value = 0
	startTime.value = 0
	playing.value = false
	audioBuffer.value = undefined
	sourceNode.value = undefined
}

onUnmounted(resetState)

function updateCurrentTime() {
	const context = unref(audioContext)
	if (!context) return
	currentTime.value = context.currentTime - startTime.value + startOffset.value
}

function renderAnimationFrame() {
	updateCurrentTime()
	rAF = requestAnimationFrame(renderAnimationFrame)
}

function startPlaying() {
	playing.value = true
	if (rAF !== null) cancelAnimationFrame(rAF)
	rAF = requestAnimationFrame(renderAnimationFrame)
}

function stopPlaying(source: AudioBufferSourceNode) {
	playing.value = false
	if (rAF !== null) cancelAnimationFrame(rAF)
	source.stop()
}

function initializeSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	sourceNode.value = bufferSource
	return bufferSource
}

function fillGapWithSilence(context: AudioContext, buffer: AudioBuffer, source: AudioBufferSourceNode) {
	const gap = buffer.duration - startOffset.value
	const silence = context.createBufferSource()
	silence.buffer = context.createBuffer(1, gap * context.sampleRate, context.sampleRate)
	silence.connect(context.destination)
	silence.start(0)
	silence.stop(gap)
}

async function play() {
	const context = unref(audioContext)
	const buffer = unref(audioBuffer)
	if (!context || !buffer) {
		console.warn('Cannot play audio: context or buffer is not initialized')
		return
	}
	startTime.value = context.currentTime
	const source = initializeSourceNode(context, buffer)
	source.connect(context.destination)
	const isOutOfRange = startOffset.value >= buffer.duration || startOffset.value < 0
	if (isOutOfRange) {
		fillGapWithSilence(context, buffer, source)
	}
	source.start(0, startOffset.value % buffer.duration, buffer.duration - startOffset.value)
	startPlaying()
}

function pause() {
	if (!playing.value) return
	const context = unref(audioContext)
	const source = unref(sourceNode)
	if (!context || !source) {
		console.warn('Cannot pause audio: context or source is not initialized')
		return
	}
	startOffset.value += context.currentTime - startTime.value
	stopPlaying(source)
}

const deck = useTemplateRef<InstanceType<typeof VirtualDeck>>('deck')
const stylus = useTemplateRef<InstanceType<typeof VirtualDeckStylus>>('stylus')
const { isInteracting, progress } = useVirtualDeck(deck, stylus, currentTime, duration)

const wasPlaying = ref<boolean>(false)

watch(isInteracting, (interacting) => {
	startOffset.value = currentTime.value
	if (interacting) {
		wasPlaying.value = playing.value
		pause()
	} else if (wasPlaying.value) {
		play()
	}
})

</script>

<template>
	<div>
		<!-- to be re-created -->
	</div>
</template>
