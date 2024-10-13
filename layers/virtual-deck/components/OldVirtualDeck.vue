<script lang="ts" setup>
import { VirtualDeck, VirtualDeckStylus } from '#components'
import VirtualDeckProgressCircle from '~~/layers/virtual-deck/components/VirtualDeckProgressCircle.vue'

const { url } = defineProps<{
	url?: string
}>()


watch(() => url, async (newValue, oldValue) => {
	if (oldValue && !newValue) {
		cleanupRefs()
		return
	}
	await setupBufferAndSourceNode()
}, { immediate: true })


const { audioContext } = useAudioContext()

const audioBuffer = shallowRef<AudioBuffer>()
const sourceNode = shallowRef<AudioBufferSourceNode>()
const constantSource = shallowRef<ConstantSourceNode>()

const currentTime = ref<number>(0)
const duration = ref<number>(0)
const playing = ref<boolean>(false)

const remainingTime = computed(() => duration.value - currentTime.value)
const isReady = computed<boolean>(() => !!audioBuffer.value)

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

function initializeAudioContext(): AudioContext {
	const context = audioContext.value ??= new AudioContext()
	if (context.state === 'suspended') context.resume()
	return context
}

const startTime = ref<number>(0)
const startOffset = ref<number>(0)

function updateCurrentTime() {
	const context = unref(audioContext)
	if (!context) return
	currentTime.value = context.currentTime - startTime.value + startOffset.value
}

function initializeSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	sourceNode.value = bufferSource
	return bufferSource
}

function initializeAndConnectSource(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const source = initializeSourceNode(context, buffer)
	source.connect(context.destination)
	return source
}

async function setupBufferAndSourceNode() {
	const context = initializeAudioContext()
	const buffer = await initializeAudioBuffer(context, url)
	const source = initializeSourceNode(context, buffer)
}

let rAF: number | null = null

function cleanupRefs() {
	if (rAF !== null) cancelAnimationFrame(rAF)

	duration.value = 0
	currentTime.value = 0
	startOffset.value = 0
	playing.value = false

	audioBuffer.value = undefined
	sourceNode.value = undefined
}

onUnmounted(() => {
	cleanupRefs()
})

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

async function play() {
	const context = unref(audioContext)
	const buffer = unref(audioBuffer)
	if (!context || !buffer) {
		console.warn('Cannot play audio: context or buffer is not initialized')
		return
	}
	startTime.value = context.currentTime
	const source = initializeAndConnectSource(context, buffer)
	const isOutOfRange = startOffset.value >= buffer.duration || startOffset.value < 0
	if (isOutOfRange) {
		console.warn('Cannot play audio: start offset is out of range')
		return
	}
	source.start(0, startOffset.value % buffer.duration, buffer.duration - startOffset.value)
	startPlaying()
}

// preserve pitch while changing speed
//async function play2() {
// 	const context = unref(audioContext)
// 	const buffer = unref(audioBuffer)
// 	if (!context || !buffer) {
// 		console.warn('Cannot play audio: context or buffer is not initialized')
// 		return
// 	}
//
// 	const rate = 1.5 // Change this rate, e.g., 1.5 to speed up by 50%
// 	const offlineContext = new OfflineAudioContext({
// 		numberOfChannels: buffer.numberOfChannels,
// 		length: buffer.length,
// 		sampleRate: context.sampleRate
// 	})
//
// 	const source = offlineContext.createBufferSource()
// 	source.buffer = buffer
// 	source.playbackRate.value = rate // Speed up, but pitch will change
//
// 	const pitchShift = offlineContext.createBiquadFilter()
// 	pitchShift.type = 'allpass'
// 	pitchShift.frequency.value = 1000 // Adjust pitch shifting parameters
//
// 	source.connect(pitchShift)
// 	pitchShift.connect(offlineContext.destination)
//
// 	source.start(0)
//
// 	const renderedBuffer = await offlineContext.startRendering()
//
// 	// Now play the rendered buffer in the main context with pitch preserved
// 	const outputSource = initializeAndConnectSource(context, renderedBuffer)
// 	outputSource.start(0)
// 	startPlaying()
// }

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
	<LayoutContainer ref="deck" :class="!isReady && 'pointer-events-none opacity-50 filter grayscale'">
		<template #progress>
			<VirtualDeckProgressCircle :progress="progress" />
		</template>
		<template #stylus>
			<VirtualDeckStylus ref="stylus" />
		</template>
		<template #surface>
			<VirtualDeckTrackPanel
				:current-time="currentTime"
				:disabled="!isReady"
				:remaining-time="remainingTime"
			/>
		</template>
	</LayoutContainer>
</template>
