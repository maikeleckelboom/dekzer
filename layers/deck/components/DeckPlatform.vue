<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import type { Deck } from '~~/layers/deck/stores/deck'
import DeckGainFader from '~/components/DeckGainFader.vue'
import { useAudioLevelAnalyser } from '~/composables/useAudioLevelAnalyser'
import VirtualDeck from '~~/layers/virtual-deck/components/VirtualDeck.vue'
import { guess } from 'web-audio-beat-detector'
import { canPlay, createAnalysers, createBufferSourceNode } from '~/utils/audio'

interface DeckProps extends DeckRootProps {
  deck: Deck
}

const { deck } = defineProps<DeckProps>()

const deckStore = useDeckStore()

const trackStore = useTrackStore()

const track = deckStore.computedTrack(deck)

/**
 * The time in seconds when the track started playing.
 */
const startTime = shallowRef<number>(0)

/**
 * The time in seconds from the start of the track.
 */
const startOffset = shallowRef<number>(0)

/**
 * The current time in seconds from the start of the track.
 */
const currentTime = shallowRef<number>(0)

/**
 * Whether the track is currently playing.
 */
const playing = shallowRef<boolean>(false)

/**
 * The audio buffer of the track.
 */
const audioBuffer = shallowRef<AudioBuffer | null>(null)

/**
 * The audio buffer source node.
 */
const sourceNode = shallowRef<AudioBufferSourceNode | null>(null)

const { audioContext, getAudioContext } = useAudioContext()

let rAF: number | null = null

function startPlaybackPreSync(context: AudioContext, playbackStartTime: number) {
  const timeTillStart = playbackStartTime - context.currentTime
  if (timeTillStart > 0) {
    currentTime.value = startOffset.value = timeTillStart * -1
    rAF = requestAnimationFrame(() => startPlaybackPreSync(context, playbackStartTime))
  } else {
    startTime.value = context.currentTime
    startPlaying()
  }
}

function schedulePlayback(context: AudioContext, source: AudioBufferSourceNode) {
  const playbackStartTime = context.currentTime + Math.abs(startOffset.value)
  source.start(playbackStartTime)

  startPlaybackPreSync(context, playbackStartTime)
  playing.value = true
}

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

const { channels, start:startAnalyzer, stop:stopAnalyzer } = useAudioLevelAnalyser(analyserNode, analyserNodeR, 2048)

function setAnalyserNodes(context: AudioContext): [AnalyserNode, AnalyserNode] {
  const [analyser, analyserR] = createAnalysers(context, 1024)
  analyserNode.value = analyser
  analyserNodeR.value = analyserR
  return [analyser, analyserR]
}

function setSourceNode(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const source = createBufferSourceNode(context, buffer)
  sourceNode.value = source
  return source
}

async function play() {
  const context = await getAudioContext()
  const buffer = unref(audioBuffer)!
  if (!canPlay(context, buffer, playing)) return
  const source = setSourceNode(context, buffer)
  setAnalyserNodes(context)
  source.connect(context.destination)
  startAnalyzer()

  handlePlayback(context, buffer, source)
}

function handlePlayback(
  context: AudioContext,
  buffer: AudioBuffer,
  source: AudioBufferSourceNode
) {
  startTime.value = context.currentTime
  const offsetStart = unref(startOffset)
  if (offsetStart < 0) {
    schedulePlayback(context, source)
  } else if (offsetStart >= buffer.duration) {
    startPlaying()
  } else {
    source.start(0, offsetStart, buffer.duration - offsetStart)
    startPlaying()
  }
}

function pause() {
  const context = unref(audioContext)
  if (!context) return
  startOffset.value += context.currentTime - startTime.value
  stopPlaying()
  stopAnalyzer()
}

const wasPlaying = shallowRef<boolean>(false)

function onPlayPause(playing: boolean) {
  wasPlaying.value = false
  if (playing) play()
  else pause()
}

async function createAndLoadTrack(file: File) {
  const url = URL.createObjectURL(file)
  try {
    const response = await fetch(url, { headers: { ResponseType: 'stream' } })
    if (!response.body) return
    const metadata = await parseWebStream(response.body, {
      mimeType: file.type,
      size: file.size,
      url
    })
    const track = trackStore.createTrack(url, metadata)
    trackStore.addTrack(track)
    deckStore.load(deck, track)
  } catch (error) {
    console.error(error)
  }
}

const duration = computedEager(() => track.value?.format.duration)
const nativeBpm = computedEager(() => track.value?.common.bpm)

const pitchRange = shallowRef<8 | 16 | 50>(8)
const pitchDelta = shallowRef<number>(0)
const tempo = shallowRef({ bpm: 0, offset: 0 })

whenever(audioBuffer, (buffer) => tryWithoutFail(async () => (tempo.value = await guess(buffer))))
whenever(tempo, (tempo) => {
  console.log('Native BPM', nativeBpm.value)
  console.log('Guessed BPM', tempo.bpm, 'Offset', tempo.offset)
})

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

const isLoaded = computed(() => !!track.value && !!audioBuffer.value)
</script>

<template>
  <DeckRoot
    :class="
      cn('items-center md:even:flex-row-reverse odd:[&>div]:first:mr-4 odd:[&>div]:last:ml-4')
    "
    :disabled="!isLoaded"
    class="flex"
    @load="createAndLoadTrack">
    <div class="grid h-full place-items-center gap-4 py-1">
      <DemoTempoFader />
    </div>

    <div class="relative flex w-full flex-col overflow-clip">
      <TrackTitleBar :track="track" />
      <WaveformOverview
        v-model:current-time="currentTime"
        v-model:interacting="interacting"
        v-model:start-offset="startOffset"
        :track="track" />

      <div
        :class="
          cn(
            'flex flex-wrap justify-end gap-2 p-2',
            deck.index % 2 === 0 && 'md:flex-row-reverse'
          )
        ">
        <template v-if="track">
          <DeckButton @click="ejectTrack"> Eject</DeckButton>
          <DeckPlayPause
            :disabled="!isLoaded"
            :playing="playing"
            @playPause="onPlayPause" />
        </template>
      </div>
    </div>
    <div
      :class="
        cn(
          'flex w-fit flex-nowrap gap-4 p-2 md:p-2',
          deck.index % 2 === 0 && 'md:flex-row-reverse'
        )
      ">
      <VirtualDeck
        v-model:current-time="currentTime"
        v-model:interacting="interacting"
        :bpm="tempo.bpm"
        :disabled="!track?.url"
        :duration="duration"
        :pitch-delta="pitchDelta"
        :pitch-range="pitchRange" />
      <DeckGainFader :channels="channels" />
    </div>
  </DeckRoot>
</template>
