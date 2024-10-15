<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import { useTrackStore } from '~~/layers/track/stores/track'
import { type IDeck, useDeckStore } from '~~/layers/deck/stores/deck'
import { useSharedAudioContext } from '~/composables/useAudioContext'

interface DeckProps extends DeckRootProps {
	deck: IDeck
}

const { deck } = defineProps<DeckProps>()

const deckStore = useDeckStore()
const trackStore = useTrackStore()

async function createAndLoadTrack(file: File) {
	const url = URL.createObjectURL(file)
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const metadata = await parseWebStream(response.body, { mimeType: file.type, size: file.size, url })
	const track = trackStore.createTrack(url, metadata)
	trackStore.addTrack(track)
	deckStore.load(deck, track)
}

const track = deckStore.computedTrack(deck)

const playing = ref<boolean>(false)
const sourceNode = ref<AudioBufferSourceNode | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)
const currentTime = ref<number>(0)
const pitchRange = ref<8 | 16 | 50>(8)
const pitch = ref<number>(0)


async function fetchAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const response = await fetch(url, { headers: { 'ResponseType': 'stream' } })
	const arrayBuffer = await response.arrayBuffer()
	return await context.decodeAudioData(arrayBuffer)
}

async function initializeAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
	const buffer = await fetchAudioBuffer(context, url)
	audioBuffer.value = buffer
	return buffer
}

const startTime = ref<number>(0)
const startOffset = ref<number>(0)
watch([startOffset, startTime], ([offset, time]) => {
	console.log('startOffset', offset, 'startTime', time)
})
let rAF: number | null = null

function resetState() {
	if (rAF !== null) {
		cancelAnimationFrame(rAF)
	}
	currentTime.value = 0
	startOffset.value = 0
	startTime.value = 0
	playing.value = false
	audioBuffer.value = undefined
	sourceNode.value = undefined


	audioContext.value = null
	audioBuffer.value = null
	currentTime.value = 0
}

const { audioContext, audioContextInit } = useSharedAudioContext()
onMounted(audioContextInit)

whenever(logicAnd(track, () => track.value?.url), async () => {
	const context = unref(audioContext)
	if (!context) {
		console.warn('Cannot load track: audio context is not initialized')
		return
	}
	const buffer = await initializeAudioBuffer(context, track.value!.url)
	console.log('Loaded audio buffer', buffer)
	audioBuffer.value = buffer
})

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

async function play() {
	const context = unref(audioContext)
	const buffer = unref(audioBuffer)
	if (!context || !buffer) {
		console.warn('Cannot play audio: context or buffer is not initialized', { context, buffer })
		return
	}
	startTime.value = context.currentTime
	const source = initializeSourceNode(context, buffer)
	source.connect(context.destination)
	const isOutOfRange = startOffset.value >= buffer.duration || startOffset.value < 0
	if (isOutOfRange) {
		console.warn('Cannot play audio: startOffset is out of range')
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

function onPlayPause(playing: boolean) {
	if (playing) {
		play()
	} else {
		pause()
	}
}

const interacting = shallowRef<boolean>(false)
const wasPlaying = shallowRef<boolean>(false)

watch(interacting, (interacting) => {
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
	<DeckRoot :active="!!track" @trackLoaded="createAndLoadTrack">
		<div class="border flex-grow flex">
			<TrackOverview>
				<!-- -->
			</TrackOverview>
			<DeckPlayPause :playing="playing" @playPause="onPlayPause" />
		</div>
		<div class="border">
			<VirtualDeck
				v-model:currentTime="currentTime"
				v-model:interacting="interacting"
				v-model:start-offset="startOffset"
				:bpm="track?.common?.bpm"
				:duration="track?.format?.duration"
				:pitch="pitch"
				:pitchRange="pitchRange"

			/>
		</div>
	</DeckRoot>
</template>