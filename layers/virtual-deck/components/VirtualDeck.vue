<script lang="ts" setup>
import { clamp } from '@vueuse/core'
import { VirtualDeck } from '#components'
import type { Track } from '~~/layers/track/types'

const { url, track } = defineProps<{
	url: string | null
	track?: Track
}>()

const audioContext = shallowRef<AudioContext>()
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
	const context = new AudioContext({ latencyHint: 'interactive' })
	audioContext.value = context
	return context
}

let rAF: number | null = null
let startTime: number = 0
const startOffset = ref<number>(0)

function updateCurrentTime() {
	const context = unref(audioContext)
	if (!context) return
	currentTime.value = context.currentTime - startTime + startOffset.value
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

onMounted(async () => {
	if (!url) return
	const context = initializeAudioContext()
	const buffer = await initializeAudioBuffer(context, url)
	const source = initializeSourceNode(context, buffer)
})

function closeContextCleanupNodes() {
	if (audioContext.value) {
		audioContext.value.close()
	}

	duration.value = 0
	currentTime.value = 0
	startOffset.value = 0
	playing.value = false

	audioContext.value = undefined
	audioBuffer.value = undefined
	sourceNode.value = undefined
}

onUnmounted(() => {
	if (rAF !== null) {
		cancelAnimationFrame(rAF)
	}
	closeContextCleanupNodes()
})

function renderAnimationFrame() {
	updateCurrentTime()
	rAF = requestAnimationFrame(renderAnimationFrame)
}

function startPlaying() {
	playing.value = true

	if (rAF !== null) {
		cancelAnimationFrame(rAF)
	}

	rAF = requestAnimationFrame(renderAnimationFrame)
}

function stopPlaying(source: AudioBufferSourceNode) {
	playing.value = false

	if (rAF !== null) {
		cancelAnimationFrame(rAF)
	}

	source.stop()
}

async function play() {
	const context = unref(audioContext)
	const buffer = unref(audioBuffer)

	if (!context || !buffer) {
		console.warn('Cannot play audio: context or buffer is not initialized')
		return
	}

	startTime = context.currentTime
	const source = initializeAndConnectSource(context, buffer)
	const isOutOfRange = startOffset.value >= buffer.duration || startOffset.value < 0
	if (isOutOfRange) {
		console.warn('Cannot play audio: start offset is out of range')
		return
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

	startOffset.value += context.currentTime - startTime
	stopPlaying(source)
}

const progress = computed(() => {
	if (duration.value === 0) return 0
	return clamp(currentTime.value / duration.value, 0, 1)
})

const positionIndicator = useTemplateRef<HTMLDivElement>('positionIndicator')
const deck = useTemplateRef<InstanceType<typeof VirtualDeck>>('deck')

const { isInteracting } = useVirtualDeck(deck, positionIndicator, currentTime)

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
	<div class="flex flex-col gap-8">
		<div class="flex flex-nowrap gap-x-6 p-4 rounded bg-muted/50 border-2 items-center min-w-fit">
			<LayoutContainer ref="deck" :class="!isReady && 'pointer-events-none opacity-50 filter grayscale'">
				<template #progressIndicator>
					<ProgressIndicator :progress="progress" />
				</template>
				<template #positionIndicator="{ className }">
					<div ref="positionIndicator" :class="cn(className)" />
				</template>
				<template #surface>
					<VirtualDeckSurface
						:current-time="currentTime"
						:disabled="!isReady"
						:remaining-time="remainingTime"
						:tempo="track?.tempo"
					/>
				</template>
			</LayoutContainer>
			<DeckGainFader />
		</div>
		<Button
			:disabled="!isReady"
			:label="playing ? 'Pause' : 'Play'"
			variant="secondary"
			class="w-fit"
			@click="playing ? pause() : play()">
			{{ playing ? 'Pause' : 'Play' }}
		</Button>
	</div>
</template>
