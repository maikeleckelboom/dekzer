<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import { useTrackStore } from '~~/layers/track/stores/track'
import { type IDeck, useDeckStore } from '~~/layers/deck/stores/deck'
import { useSharedAudioContext } from '~/composables/useAudioContext'
import { loadAudioBuffer } from '~/utils/audioUtils'

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

const sourceNode = ref<AudioBufferSourceNode | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)
const startTime = ref<number>(0)
const startOffset = ref<number>(0)
const currentTime = ref<number>(0)
const playing = ref<boolean>(false)


function resetState() {
	currentTime.value = 0
	startOffset.value = 0
	startTime.value = 0
	audioContext.value = null
	audioBuffer.value = null
	playing.value = false
	deckStore.eject(deck)
}

const { audioContext, getAudioContext } = useSharedAudioContext()

const trackLoaded = shallowRef<boolean>(false)

whenever(logicAnd(track, () => track.value?.url), async () => {
	const context = unref(audioContext)
	if (!context) {
		console.warn('Cannot load track: audio context is not initialized')
		return
	}
	const { url } = track.value
	audioBuffer.value = await loadAudioBuffer(context, url)
	trackLoaded.value = true
})

onBeforeUnmount(() => {
	if (playing.value) pause()
	resetState()
})

function updateCurrentTime() {
	const context = unref(audioContext)
	if (!context) {
		console.warn('Cannot update current time: audio context is not initialized.')
		return
	}

	const source = unref(sourceNode)
	if (!source) {
		console.warn('Cannot update current time: source node is not initialized.')
		return
	}

	currentTime.value = context.currentTime - startTime.value + startOffset.value
}

let rAF: number | null = null

function renderAnimationFrame() {
	updateCurrentTime()
	// .. more rendering logic
	rAF = requestAnimationFrame(renderAnimationFrame)
}

function startPlaying(quiet: boolean = false) {
	if (!quiet) playing.value = true
	if (rAF !== null) cancelAnimationFrame(rAF)
	rAF = requestAnimationFrame(renderAnimationFrame)
}

function stopPlaying(source: AudioBufferSourceNode, quiet: boolean = false) {
	if (!quiet) playing.value = false
	if (rAF !== null) cancelAnimationFrame(rAF)
	source.stop()
}

function initializeSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const bufferSource = context.createBufferSource()
	bufferSource.buffer = buffer
	sourceNode.value = bufferSource
	return sourceNode.value
}

async function schedulePlayback(context: AudioContext, buffer: AudioBuffer) {


}

async function play(options: { quiet: boolean } = { quiet: false }) {
	let context = unref(audioContext)
	let buffer = unref(audioBuffer)

	if (!context || !buffer) {
		context = await getAudioContext()

		const { url } = track.value
		buffer = await loadAudioBuffer(context, url)
	}

	const isOutOfRange = startOffset.value < 0 || startOffset.value >= buffer.duration

	if (isOutOfRange) {
		await schedulePlayback(context, buffer)
		return
	}

	startTime.value = context.currentTime
	const source = initializeSourceNode(context, buffer)
	source.connect(context.destination)
	source.start(0, startOffset.value % buffer.duration, buffer.duration - startOffset.value)
	startPlaying(options.quiet)
}

function pause(options: { quiet: boolean } = { quiet: false }) {
	const context = unref(audioContext)
	const source = unref(sourceNode)

	if (!context || !source) return
	if (!playing.value) return

	startOffset.value += context.currentTime - startTime.value
	stopPlaying(source, options.quiet)
}

function onPlayPause(playing: boolean) {
	playing ? play() : pause()
}

const interacting = shallowRef<boolean>(false)
const wasPlaying = shallowRef<boolean>(false)

watch(interacting, (interacting) => {

	const context = unref(audioContext)

	if (!context) {
		return
	}

	startOffset.value = currentTime.value
	if (interacting) {
		pause({ quiet: true })
	} else if (playing.value) {
		play({ quiet: true })
	}
})


const pitchRange = ref<8 | 16 | 50>(8)
const pitch = ref<number>(0)
</script>

<template>
	<DeckRoot :disabled="!trackLoaded" class="flex even:flex-row-reverse" @trackLoaded="createAndLoadTrack">
		<div class="border flex-col flex w-full">
			<TrackOverview class="p-2">
				<div class="mb-2">
					<strong>currentTime</strong>
					<p class="tabular-nums truncate">{{ currentTime.toFixed(2) }}</p>
				</div>
				<DeckPlayPause :playing="playing" class="rounded" @playPause="onPlayPause" />
			</TrackOverview>
		</div>
		<div class="border flex w-fit p-2">
			<VirtualDeck
				v-model:currentTime="currentTime"
				v-model:interacting="interacting"
				:bpm="track?.common.bpm"
				:duration="track?.format.duration"
				:pitch="pitch"
				:pitchRange="pitchRange"
			/>
		</div>
	</DeckRoot>
</template>