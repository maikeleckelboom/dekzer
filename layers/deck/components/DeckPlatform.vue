<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import type { Deck } from '~~/layers/deck/stores/deck'

interface DeckProps extends DeckRootProps {
  deck: Deck
}

const { deck } = defineProps<DeckProps>()

const deckStore = useDeckStore()
const trackStore = useTrackStore()

const track = deckStore.computedTrack(deck)

const startTime = shallowRef<number>(0)
const startOffset = shallowRef<number>(0)
const currentTime = shallowRef<number>(0)
const playing = shallowRef<boolean>(false)
const audioBuffer = shallowRef<AudioBuffer | null>(null)
const sourceNode = shallowRef<AudioBufferSourceNode | null>(null)
const constantSourceNode = shallowRef<ConstantSourceNode | null>(null)

const loaded = computed(() => !!track.value && !!audioBuffer.value)

const { audioContext, getAudioContext} = useSharedAudioContext()

let rAF: number | null = null

function playScheduledTime(context: AudioContext, playbackStart: number) {
  const timeUntilStart = playbackStart - context.currentTime
  if (timeUntilStart > 0) {
    currentTime.value = startOffset.value = timeUntilStart * -1
    startTime.value = context.currentTime
    rAF = requestAnimationFrame(() => playScheduledTime(context, playbackStart))
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
  playScheduledTime(context, playbackStart)
  playing.value = true
}

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
  tryWithoutFail(() => {
    sourceNode.value?.stop()
  })
}

const analyserNode = shallowRef<AnalyserNode | null>(null)
const analyserNodeR = shallowRef<AnalyserNode | null>(null)

const { leftVolume, rightVolume, start, stop } = useVolumeAnalyzer(
  analyserNode,
  analyserNodeR,
  2048
)

function setupAnalyserNodes(
  context: AudioContext,
  source: AudioBufferSourceNode
): [AnalyserNode, AnalyserNode] {
  const [analyser, analyserR] = createAnalyserNodes(context, source)
  analyserNode.value = analyser
  analyserNodeR.value = analyserR
  return [analyser, analyserR]
}

function setupSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const source = createBufferSourceNode(context, buffer)
  sourceNode.value = source
  return source
}

function setupConstantSourceNode(context: AudioContext) {
  const source = createConstantSourceNode(context)
  constantSourceNode.value = source
  return source
}

async function play() {
  const context = await getAudioContext()
  const buffer = unref(audioBuffer)
  if (!canPlay(context, buffer)) return
  const source = setupSourceNode(context, buffer)


  setupAnalyserNodes(context, source)
  source.connect(context.destination)
  start()

  startTime.value = context.currentTime
  handlePlayback(context, buffer)
}

function handlePlayback(context: AudioContext, buffer: AudioBuffer) {
  const offsetStart = unref(startOffset)
  if (offsetStart < 0) {
    setupConstantSourceNode(context)
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
  stop()
}

const wasPlaying = shallowRef<boolean>(false)

function onPlayPause(playing: boolean) {
  wasPlaying.value = false
  if (playing) play()
  else pause()
}

async function createAndLoadTrack(file: File) {
  const url = URL.createObjectURL(file)
  const response = await fetch(url, { headers: { ResponseType: 'stream' } })
  const metadata = await parseWebStream(response.body, {
    mimeType: file.type,
    size: file.size,
    url
  })
  const track = trackStore.createTrack(url, metadata)
  trackStore.addTrack(track)
  deckStore.load(deck, track)
}

const interacting = shallowRef<boolean>(false)

watch(
  interacting,
  async (interacting) => {
    startOffset.value = currentTime.value
    if (interacting) {
      wasPlaying.value = playing.value
      pause()
    } else if (wasPlaying.value) {
      await play()
    }
  },
  { flush: 'sync' }
)

whenever(track, async ({ url }) => {
  resetDeck()
  const context = await getAudioContext()
  audioBuffer.value = await loadAudioBuffer(context, url)
})

onMounted(async () => {
  // const context = await getAudioContext()
  // const gain = new GainNode(context)
  // deckGainNodes.value.push(gain)
  // gain.connect(masterGainNode.value)
  // console.log(deckGainNodes.value, 'Deck Gain Nodes')
  // console.log(masterGainNode.value, 'Master Gain Node')
})

onBeforeUnmount(() => {
  if (playing.value) pause()
  deckStore.eject(deck)
})

function resetDeck() {
  stopPlaying()
  stop()

  currentTime.value = 0
  audioBuffer.value = null
  playing.value = false
  startTime.value = 0
  startOffset.value = 0

  if (rAF !== null) {
    cancelAnimationFrame(rAF)
    rAF = null
  }

  tryWithoutFail(() => {
    sourceNode.value?.disconnect()
    sourceNode.value?.stop()
    sourceNode.value = null
  })

  tryWithoutFail(() => {
    constantSourceNode.value?.disconnect()
    constantSourceNode.value?.stop()
    constantSourceNode.value = null
  })

  tryWithoutFail(() => {
    analyserNode.value?.disconnect()
    analyserNode.value = null
  })

  tryWithoutFail(() => {
    analyserNodeR.value?.disconnect()
    analyserNodeR.value = null
  })
}

function ejectTrack() {
  deckStore.eject(deck)
  resetDeck()
}

const duration = computedEager(() => track.value?.format.duration)
const bpm = computedEager(() => track.value?.common.bpm)
</script>

<template>
  <DeckRoot
    :class="cn('md:even:flex-row-reverse')"
    :disabled="!loaded"
    class="flex bg-black"
    @load="createAndLoadTrack">
    <div class="flex w-full flex-col overflow-hidden relative">
      <TrackTitleBar :track="track" />
      <WaveformOverview
        v-model:current-time="currentTime"
        v-model:interacting="interacting"
        v-model:start-offset="startOffset"
        :track="track" />

      <div
        :class="
          cn('flex flex-wrap justify-end gap-2 p-2', deck.index % 2 === 0 && 'md:flex-row-reverse')
        ">
        <DeckButton
         v-if="track"
          @click="ejectTrack">
          Eject
        </DeckButton>
        <DeckPlayPause
          :disabled="!loaded"
          :playing="playing"
          @playPause="onPlayPause" />
      </div>
    </div>
    <div
      :class="
        cn('flex w-fit flex-nowrap gap-4 p-2 md:p-2', deck.index % 2 === 0 && 'md:flex-row-reverse')
      ">
      <VirtualDeck
        v-model:currentTime="currentTime"
        v-model:interacting="interacting"
        :bpm="bpm"
        :disabled="!track"
        :duration="duration" />
      <TrackGainFader :channels="[leftVolume, rightVolume]" />
    </div>
  </DeckRoot>
</template>
