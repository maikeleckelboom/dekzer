<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import { type IDeck, useDeckStore } from '~~/layers/deck/stores/deck'
import { useTrackStore } from '~~/layers/track/stores/track'

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

const startTime = shallowRef<number>(0)
const startOffset = shallowRef<number>(0)
const currentTime = shallowRef<number>(0)
const playing = shallowRef<boolean>(false)
const loaded = shallowRef<boolean>(false)

const sourceNode = shallowRef<AudioBufferSourceNode | null>(null)
const constantSourceNode = shallowRef<ConstantSourceNode | null>(null)
const audioBuffer = shallowRef<AudioBuffer | null>(null)
const analyserNode = shallowRef<AnalyserNode | null>(null)
const analyserNodeR = shallowRef<AnalyserNode | null>(null)

const {
	rightVolume,
	leftVolume,
	start: startAnalyserNodes,
	stop: stopAnalyserNodes
} = useVolumeAnalyzer(analyserNode, analyserNodeR, 2048)

const { audioContext, getAudioContext } = useSharedAudioContext()

function initializeConstantSourceNode(context: AudioContext) {
	constantSourceNode.value = context.createConstantSource()
	constantSourceNode.value.offset.value = 0
	constantSourceNode.value.start(context.currentTime)
}

let rAF: number | null = null

function startPlayingWhenReady(context: AudioContext, playbackStart: number) {
	const timeUntilStart = playbackStart - context.currentTime
	if (timeUntilStart > 0) {
		currentTime.value = startOffset.value = (timeUntilStart * -1)
		startTime.value = context.currentTime
		rAF = requestAnimationFrame(() => startPlayingWhenReady(context, playbackStart))
	} else {
		startTime.value = context.currentTime
		startPlaying()
	}
}

function schedulePlayback() {
	const context = unref(audioContext)
	const source = unref(sourceNode)
	if (!context || !source) return
	const playbackStart = context.currentTime + Math.abs(startOffset.value)
	source.start(playbackStart)
	startPlayingWhenReady(context, playbackStart)
	playing.value = true
}

whenever(logicAnd(track, () => 'url' in track.value), async () => {
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
	if (rAF !== null) {
		cancelAnimationFrame(rAF)
		rAF = null
	}
	rAF = requestAnimationFrame(renderAnimationFrame)
}

function stopPlaying() {
	playing.value = false
	if (rAF !== null) {
		cancelAnimationFrame(rAF)
		rAF = null
	}
	try {
		sourceNode.value?.stop()
		sourceNode.value = null
		// constantSourceNode.value?.stop()
		// constantSourceNode.value = null
	} catch {
	}
}
async function play() {
	const context = await getAudioContext()
	const buffer = unref(audioBuffer)

	if (!canPlay(context, buffer)) {
		return
	}

	const source = setupSourceNode(context, buffer)
	setupAnalyserNodes(context, source)
	setupDestination(context, source)

	startAnalyserNodes()
	startTime.value = context.currentTime

	handlePlayback(context, buffer)
}

function canPlay(context: AudioContext | null, buffer: AudioBuffer | null): boolean {
	return !!(context && buffer && !playing.value)
}

function setupSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
	const source = createBufferSourceNode(context, buffer)
	sourceNode.value = source
	return source
}

function setupAnalyserNodes(context: AudioContext, source: AudioBufferSourceNode) {
	const [analyser, analyserR] = createAnalysers(context)
	const splitter = context.createChannelSplitter(2)

	source.connect(splitter)
	splitter.connect(analyser, 0)
	splitter.connect(analyserR, 1)

	analyserNode.value = analyser
	analyserNodeR.value = analyserR
}

function createAnalysers(context: AudioContext, fftSize: 2048): [AnalyserNode, AnalyserNode] {
	const analyser = context.createAnalyser()
	const analyserR = context.createAnalyser()

	analyser.fftSize = fftSize
	analyserR.fftSize = fftSize

	return [analyser, analyserR]
}

function setupDestination(context: AudioContext, source: AudioBufferSourceNode) {
	source.connect(context.destination)
}

function handlePlayback(context: AudioContext, buffer: AudioBuffer) {
	const offsetStart = unref(startOffset)

	if (offsetStart < 0) {
		initializeConstantSourceNode(context)
		schedulePlayback(buffer)
	} else if (offsetStart >= buffer.duration) {
		startPlaying()
	} else {
		sourceNode.value.start(0, offsetStart, buffer.duration - offsetStart)
		startPlaying()
	}
}

function pause() {
	const context = unref(audioContext)
	if (!context) return
	startOffset.value += context.currentTime - startTime.value
	stopPlaying()
	stopAnalyserNodes()
}

const interacting = shallowRef<boolean>(false)
const wasPlaying = shallowRef<boolean>(false)

function onPlayPause(playing: boolean) {
	wasPlaying.value = false
	if (playing) play()
	else pause()
}

watch(interacting, async (interacting) => {
	startOffset.value = currentTime.value
	if (interacting) {
		wasPlaying.value = playing.value
		pause()
	} else if (wasPlaying.value) {
		await play()
	}
})
</script>

<template>
	<DeckRoot :disabled="!loaded" class="flex even:flex-row-reverse" @load="createAndLoadTrack">
		<div class="border flex-col flex w-full">
			<TrackOverview class="p-2">
				<div class="mb-2">

				</div>
				<DeckPlayPause :disabled="!loaded" :playing="playing" class="rounded" @playPause="onPlayPause" />
			</TrackOverview>
		</div>
		<div class="border flex flex-nowrap gap-4 w-fit p-2">
			<VirtualDeck
				v-model:currentTime="currentTime"
				v-model:interacting="interacting"
				:bpm="track?.common.bpm"
				:duration="track?.format.duration"
			/>
			<DeckGainFader
				:channels="[leftVolume, rightVolume]"
			/>
		</div>
	</DeckRoot>
</template>