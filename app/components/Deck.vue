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

const sourceNode = ref<AudioBufferSourceNode>()
const constantSourceNode = ref<ConstantSourceNode>()

function startConstantSourceNode(context: AudioContext) {
	const constantSrc = context.createConstantSource()
	constantSrc.offset.value = 0
	constantSrc.start(context.currentTime)
	constantSourceNode.value = constantSrc
}

function getTimeUntilTrackStarts(context: AudioContext, startPlaybackTime: number) {
	return startPlaybackTime - context.currentTime
}

function updateCurrentTimeUntilStart(startPlaybackTime: number) {
	const context = unref(audioContext)
	if (!context) return

	const timeUntilStart = getTimeUntilTrackStarts(context, startPlaybackTime)

	if (timeUntilStart > 0) {
		currentTime.value = startOffset.value = (timeUntilStart * -1)
		rAF = requestAnimationFrame(() => updateCurrentTimeUntilStart(startPlaybackTime))
		return
	}

	if (rAF !== null) {
		cancelAnimationFrame(rAF)
		rAF = null
	}

	// Ready to start playback
	startTime.value = context.currentTime
	startPlaying()
}


// Schedule track playback and check when it will start
function scheduleTrackPlayback() {
	const context = unref(audioContext)
	const source = unref(sourceNode)
	if (!context || !source) return
	const playbackStartTime = context.currentTime + Math.abs(startOffset.value)
	// Start normal playback at the scheduled time
	source.start(playbackStartTime)
	// Start the constant source node to track time
	startConstantSourceNode(context)
	// Render the current time until the track starts
	updateCurrentTimeUntilStart(playbackStartTime)
	playing.value = true
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

function stopPlaying() {
	playing.value = false

	if (rAF !== null) {
		cancelAnimationFrame(rAF)
	}

	if (sourceNode.value) {
		sourceNode.value.stop()
		sourceNode.value = null
	}

	if (constantSourceNode.value) {
		constantSourceNode.value.stop()
		constantSourceNode.value = null
	}
}


async function play() {
	const context = await getAudioContext()
	const buffer = unref(audioBuffer)
	if (!context || !buffer || playing.value) {
		return
	}

	const start = unref(startOffset)

	const source = createBufferSourceNode(context, buffer)
	sourceNode.value = source
	source.connect(context.destination)

	startTime.value = context.currentTime

	if (start < 0) {
		scheduleTrackPlayback(buffer)
	} else if (start >= buffer.duration) {

	} else {
		source.start(0, start % buffer.duration, buffer.duration - start)
		startPlaying()
	}
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