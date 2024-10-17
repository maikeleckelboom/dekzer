<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import { useTrackStore } from '~~/layers/track/stores/track'
import { type IDeck, useDeckStore } from '~~/layers/deck/stores/deck'
import { useSharedAudioContext } from '~/composables/useAudioContext'
import { createBufferSourceNode, loadAudioBuffer } from '~/utils/audioUtils'

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

const audioBuffer = ref<AudioBuffer | null>(null)
const startTime = ref<number>(0)
const startOffset = ref<number>(0)
const currentTime = ref<number>(0)
const playing = ref<boolean>(false)
let rAF: number | null = null

const { audioContext, getAudioContext } = useSharedAudioContext()

const loaded = shallowRef<boolean>(false)

const sourceNode = ref<AudioBufferSourceNode | null>(null)
const constantSourceNode = ref<ConstantSourceNode | null>(null)

function startConstantSourceNode(context: AudioContext) {
	// Create and start the constant source node for tracking time
	const constantSrc = context.createConstantSource()
	constantSrc.offset.value = 0
	constantSrc.start(context.currentTime)
	constantSourceNode.value = constantSrc
}

// Function to check the remaining time before the track starts
// Function to check the remaining time before the track starts
function checkTrackStart(scheduledStartTime: number) {
	const context = unref(audioContext)
	if (!context) return
	const timeUntilStart = scheduledStartTime - context.currentTime
	return timeUntilStart > 0 ? timeUntilStart : 0
}

// Function to periodically check time remaining using requestAnimationFrame

function trackStartAnimationFrame(scheduledStartTime: number) {
	const timeRemaining = checkTrackStart(scheduledStartTime)

	if (timeRemaining > 0) {
		currentTime.value = startOffset.value = timeRemaining * -1
		rAF = requestAnimationFrame(() => trackStartAnimationFrame(scheduledStartTime))
		return
	}

	if (rAF !== null) {
		cancelAnimationFrame(rAF)
		rAF = null
	}
	const context = unref(audioContext)
	if (!context) return

	const source = unref(sourceNode)
	if (!source) return

	startTime.value = context.currentTime
	console.log('startOffset', startOffset.value, 'context.currentTime', context.currentTime, 'startTime', startTime.value, 'currentTime', currentTime.value)
	startPlaying()
}


// Schedule track playback and check when it will start
function scheduleTrackPlayback(audioBuffer: AudioBuffer, startInSeconds: number) {
	const context = unref(audioContext)
	if (!context) return

	// Schedule the playback of the track
	const trackSource = createBufferSourceNode(context, audioBuffer)
	sourceNode.value = trackSource
	trackSource.connect(context.destination)

	// Calculate the exact time when the track should start
	const scheduledStartTime = context.currentTime + Math.abs(startInSeconds)
	trackSource.start(scheduledStartTime)

	// Start the constant source node to keep track of the time
	startConstantSourceNode(context)

	// Start the animation frame loop to check the remaining time
	trackStartAnimationFrame(scheduledStartTime)
}

whenever(logicAnd(track, () => track.value?.url), async () => {
	const context = await getAudioContext()
	const { url } = track.value
	audioBuffer.value = await loadAudioBuffer(context, url)
	loaded.value = true
})

onBeforeUnmount(() => {
	if (playing.value) pause()
	deckStore.eject(deck)
})

function updateCurrentTime() {
	const context = unref(audioContext)
	const source = unref(sourceNode)
	if (!source || !context) return
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


async function play() {
	const context = await getAudioContext()
	const buffer = unref(audioBuffer)
	if (!context || !buffer || playing.value) {
		return
	}

	const start = unref(startOffset)

	const isBeforeStart = start < 0
	const isAfterEnd = start >= buffer.duration

	if (isBeforeStart) {
		// Play silence
		scheduleTrackPlayback(buffer, start)
		return
	}
	if (isAfterEnd) {
		// Play silence
		return
	}

	startTime.value = context.currentTime
	const source = createBufferSourceNode(context, buffer)
	sourceNode.value = source
	source.connect(context.destination)
	source.start(0, start % buffer.duration, buffer.duration - start)
	startPlaying()
}

function pause() {
	const context = unref(audioContext)
	const source = unref(sourceNode)
	if (!context || !source || !playing.value) return

	startOffset.value += context.currentTime - startTime.value
	stopPlaying(source)
}


const interacting = shallowRef<boolean>(false)
const wasPlaying = shallowRef<boolean>(false)

function onPlayPause(playing: boolean) {
	wasPlaying.value = false
	playing ? play() : pause()
}

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
	<DeckRoot :disabled="!loaded" class="flex even:flex-row-reverse" @load="createAndLoadTrack">
		<div class="border flex-col flex w-full">
			<TrackOverview class="p-2">
				<div class="mb-2">
					<strong>currentTime</strong>
					<p class="tabular-nums truncate">{{ currentTime }}</p>
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
			/>
		</div>
	</DeckRoot>
</template>