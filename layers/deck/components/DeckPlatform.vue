<script lang="ts" setup>
import type { DeckRootProps } from '~~/layers/deck/components/DeckRoot.vue'
import { parseWebStream } from 'music-metadata'
import type { Deck } from '~~/layers/deck/stores/deck'
import VirtualDeck from '~~/layers/virtual-deck/components/VirtualDeck.vue'
import { guess } from 'web-audio-beat-detector'

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

const audioBuffer = shallowRef<AudioBuffer>()
const sourceNode = shallowRef<AudioBufferSourceNode>()
const analyserNodes = shallowRef<AnalyserNode[]>([])

const { audioContext, getAudioContext } = useAudioContext()

function initializeAudioSourceNode(
  context: AudioContext,
  buffer: AudioBuffer
): AudioBufferSourceNode {
  const source = createBufferSourceNode(context, buffer)
  sourceNode.value = source
  if(analyserNodes.value.length === 0) {
    analyserNodes.value = createAnalysers(context)
  }
  return source
}

async function play() {
  const context = await getAudioContext()
  const buffer = unref(audioBuffer)
  if (!buffer) return

  if (sourceNode.value) {
    sourceNode.value.stop()
    sourceNode.value.disconnect()
  }

  const source = initializeAudioSourceNode(context, buffer)


  playAudioBufferSource(context, buffer, source)
}

function cleanupSourceNode(source: AudioBufferSourceNode) {
  source.onended = null
  source.disconnect()
}

function playAudioBufferSource(
  context: AudioContext,
  buffer: AudioBuffer,
  source: AudioBufferSourceNode
) {
  startTime.value = context.currentTime
  const offsetStart = unref(startOffset)
  if (offsetStart < 0) {
    schedulePlayback(context, source)
  } else {
    const duration = Math.max(0, buffer.duration - offsetStart)
    source.start(0, offsetStart, duration)
    source.onended = () => {
      cleanupSourceNode(source)
      // audioAnalyser.stop()
    }
    // audioAnalyser.start()
    startPlaying()
  }
}

function schedulePlayback(context: AudioContext, source: AudioBufferSourceNode) {
  const playbackStartTime = context.currentTime + Math.abs(startOffset.value)
  source.start(playbackStartTime)
  playing.value = true
  startPlaybackPreSync(context, playbackStartTime)

}

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

function startPlaying() {
  playing.value = true
  if (rAF !== null) {
    cancelAnimationFrame(rAF)
  }
  rAF = requestAnimationFrame(renderAnimationFrame)
}

function renderAnimationFrame() {
  if (playing.value) {
    updateCurrentTime()
    rAF = requestAnimationFrame(renderAnimationFrame)
  } else if (rAF !== null) {
    cancelAnimationFrame(rAF)
    rAF = null
  }
}

function updateCurrentTime() {
  const context = unref(audioContext)!
  currentTime.value = context.currentTime - startTime.value + startOffset.value
}

function pause() {
  const context = unref(audioContext)
  if (!context) return
  startOffset.value += context.currentTime - startTime.value
  stopPlaying()
}

function stopPlaying() {
  playing.value = false
  sourceNode.value?.stop()
  if (rAF !== null) {
    cancelAnimationFrame(rAF)
    rAF = null
  }
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

const pitchRange = shallowRef<8 | 16 | 50>(8)
const pitchDelta = shallowRef<number>(0)
const tempo = shallowRef({ bpm: 0, offset: 0 })

whenever(audioBuffer, (buffer) => tryWithoutFail(async () => (tempo.value = await guess(buffer))))

const interacting = shallowRef<boolean>(false)

watch(
  interacting,
  (interacting) => {
    startOffset.value = currentTime.value
    if (interacting) {
      wasPlaying.value = playing.value
      pause()
    } else if (wasPlaying.value) {
      play()
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
  currentTime.value = 0
  audioBuffer.value = undefined
  playing.value = false
  startTime.value = 0
  startOffset.value = 0
  sourceNode.value?.disconnect()
  sourceNode.value?.stop()
  sourceNode.value = undefined
  analyserNodes.value.forEach((node) => node.disconnect())
  analyserNodes.value = []
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
    </div>
  </DeckRoot>
</template>
