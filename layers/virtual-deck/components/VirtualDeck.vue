<script lang="ts" setup>
import { clamp } from '@vueuse/core'
import { VirtualDeck } from '#components'

const { url } = defineProps<{
	url?: string
}>()

const { audioContext } = useSharedAudioContext()

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
	const context = unref(audioContext)

	if (!context) {
		const newContext = new AudioContext()
		audioContext.value = newContext
		return newContext
	}

	if (context.state === 'suspended') {
		context.resume()
	}

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

async function setupSourceNode() {
	const context = initializeAudioContext()
	const buffer = await initializeAudioBuffer(context, url)
	const source = initializeSourceNode(context, buffer)
}

onMounted(async () => {
	if (!url) return
	await setupSourceNode()
})

let rAF: number | null = null

function closeContextCleanupNodes() {
	if (rAF !== null) cancelAnimationFrame(rAF)

	duration.value = 0
	currentTime.value = 0
	startOffset.value = 0
	playing.value = false

	audioContext.value = undefined
	audioBuffer.value = undefined
	sourceNode.value = undefined
}

onUnmounted(() => {
	closeContextCleanupNodes()
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
const stylus = useTemplateRef<HTMLDivElement>('stylus')
const { isInteracting } = useVirtualDeck(deck, stylus, currentTime)

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

watch(() => url, async (newUrl) => {
	if (!newUrl) {
		closeContextCleanupNodes()
		return
	}
	const context = initializeAudioContext()
	const buffer = await initializeAudioBuffer(context, newUrl)
	const source = initializeSourceNode(context, buffer)
})

const progress = computed(() => {
	if (duration.value === 0) return 0
	return clamp(currentTime.value / duration.value, 0, 1)
})

</script>

<template>
	<div class="flex flex-col gap-8">
		<div class="flex flex-nowrap gap-x-6 p-4 rounded bg-muted/50 border-2 items-center min-w-fit">
			<LayoutContainer ref="deck" :class="!isReady && 'pointer-events-none opacity-50 filter grayscale'">
				<template #progressIndicator>
					<ProgressIndicator :progress="progress" />
				</template>
				<template #stylus="{ className }">
					<div ref="stylus" :class="cn(className)" />
				</template>
				<template #surface>
					<VirtualDeckSurface
						:current-time="currentTime"
						:disabled="!isReady"
						:remaining-time="remainingTime"
					/>
				</template>
			</LayoutContainer>
			<DeckGainFader />
		</div>
		<Button
			v-if="isReady"
			class="w-fit"
			variant="secondary"
			@click="playing ? pause() : play()">
			{{ playing ? 'Pause' : 'Play' }}
		</Button>
	</div>
</template>
