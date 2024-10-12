<script lang="ts" setup>
import { usePlatterPosition } from '~~/layers/virtual-deck/composables/usePlatterPosition'
import { clamp } from '@vueuse/core'
import { VirtualDeck } from '#components'

const { url, tempo } = defineProps<{
	url: string
	tempo?: number
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

function updateCurrentTime(time?: number) {
	const context = unref(audioContext)
	if (!context) return

	const targetTime = time ?? context.currentTime

	currentTime.value = targetTime - startTime + startOffset.value
}

function initializeSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	sourceNode.value = bufferSource
	return bufferSource
}

function reinitializeSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
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

	const source = reinitializeSourceNode(context, buffer)
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

const { angle, angleFromSeconds } = usePlatterPosition(currentTime)
const { isInteracting } = useVirtualDeck(deck, positionIndicator, currentTime, angle)

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

watch(currentTime, (time) => {
	const elStylus = unrefElement(positionIndicator)!
	const angle = angleFromSeconds(time)
	elStylus.style.transform = `rotate(${angle}deg)`
})
</script>

<template>
	<div class="space-x-4">
		<LayoutContainer
			ref="deck"
			:class="cn(!isReady && 'pointer-events-none opacity-50 filter grayscale')"
			:progress="progress">
			<template #positionIndicator="{ className }">
				<div ref="positionIndicator" :class="cn(className)" data-name="positionIndicator" />
			</template>
			<template #surface>
				<VirtualDeckSurface
					:current-time="currentTime"
					:disabled="!isReady"
					:remaining-time="remainingTime"
					:tempo="tempo"
				/>
			</template>
		</LayoutContainer>
		<DeckGainFader />
	</div>
	<Button
		:disabled="!isReady"
		:label="playing ? 'Pause' : 'Play'"
		variant="ghost"
		@click="playing ? pause() : play()">
		{{ playing ? 'Pause' : 'Play' }}
	</Button>
</template>
