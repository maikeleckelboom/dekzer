<script lang="ts" setup>
import {
  DECK_GAIN_DEFAULT_VALUE,
  DECK_VOLUME_DEFAULT_VALUE,
  MASTER_GAIN_DEFAULT_VALUE
} from '~~/layers/fader/utils/constants'
import { createAudioLimiter, LimiterOptions } from '~/utils/limiter'

const audioCtx = shallowRef<AudioContext>()

// Master
const masterLimiter = shallowRef<DynamicsCompressorNode>()
const masterGainVal = shallowRef<number>(MASTER_GAIN_DEFAULT_VALUE)
const masterGain = shallowRef<GainNode>()
const masterAnalyserL = shallowRef<AnalyserNode>()
const masterAnalyserR = shallowRef<AnalyserNode>()

// Track A
const trackASourceEl = useTemplateRef<HTMLAudioElement>('trackASourceEl')
const trackAGain = shallowRef<GainNode>()
const trackAVolumeGain = shallowRef<GainNode>()
const trackAFadeGain = shallowRef<GainNode>()
const trackALimiter = shallowRef<DynamicsCompressorNode>()
const trackAAnalyserL = shallowRef<AnalyserNode>()
const trackAAnalyserR = shallowRef<AnalyserNode>()
const trackAGainVal = shallowRef<number>(DECK_GAIN_DEFAULT_VALUE)
const trackAVolumeVal = shallowRef<number>(DECK_VOLUME_DEFAULT_VALUE)
const crossFadeValue = shallowRef<number>(0)

// Track B
const trackBSourceEl = useTemplateRef<HTMLAudioElement>('trackBSourceEl')
const trackBGain = shallowRef<GainNode>()
const trackBGainVal = shallowRef<number>(DECK_GAIN_DEFAULT_VALUE)
const trackBVolumeGain = shallowRef<GainNode>()
const trackBFadeGain = shallowRef<GainNode>()
const trackBVolumeVal = shallowRef<number>(DECK_VOLUME_DEFAULT_VALUE)
const trackBLimiter = shallowRef<DynamicsCompressorNode>()
const trackBAnalyserL = shallowRef<AnalyserNode>()
const trackBAnalyserR = shallowRef<AnalyserNode>()

onMounted(() => {
  const audioContext = new AudioContext({ latencyHint: 'playback' })
  audioCtx.value = audioContext

  trackAGain.value = audioContext.createGain()
  trackAVolumeGain.value = audioContext.createGain()
  trackAFadeGain.value = audioContext.createGain()
  trackALimiter.value = createAudioLimiter(audioContext, LimiterOptions.track)
  trackAAnalyserL.value = audioContext.createAnalyser()
  trackAAnalyserR.value = audioContext.createAnalyser()

  trackBGain.value = audioContext.createGain()
  trackBVolumeGain.value = audioContext.createGain()
  trackBFadeGain.value = audioContext.createGain()
  trackBLimiter.value = createAudioLimiter(audioContext, LimiterOptions.track)
  trackBAnalyserL.value = audioContext.createAnalyser()
  trackBAnalyserR.value = audioContext.createAnalyser()

  masterGain.value = audioContext.createGain()

  connectDeck(
    audioContext,
    trackASourceEl.value,
    trackAGain.value,
    trackAVolumeGain.value,
    trackAAnalyserL.value,
    trackAAnalyserR.value,
    trackAFadeGain.value,
    trackALimiter.value,
    masterGain.value
  )

  connectDeck(
    audioContext,
    trackBSourceEl.value,
    trackBGain.value,
    trackBVolumeGain.value,
    trackBAnalyserL.value,
    trackBAnalyserR.value,
    trackBFadeGain.value,
    trackBLimiter.value,
    masterGain.value
  )

  masterLimiter.value = createAudioLimiter(audioContext, LimiterOptions.master)
  masterGain.value.connect(masterLimiter.value)

  masterAnalyserL.value = audioContext.createAnalyser()
  masterAnalyserR.value = audioContext.createAnalyser()

  masterGain.value.connect(masterAnalyserL.value)
  masterGain.value.connect(masterAnalyserR.value)

  masterLimiter.value.connect(audioContext.destination)
})

function connectDeck(
  audioContext: AudioContext,
  deckAudioEl: HTMLMediaElement | null,
  deckGainNode: GainNode,
  deckVolumeNode: GainNode,
  analyserL: AnalyserNode,
  analyserR: AnalyserNode,
  panGainNode: GainNode,
  limiterNode: DynamicsCompressorNode,
  masterNode: GainNode
) {
  if (!deckAudioEl) return
  const source = audioContext.createMediaElementSource(deckAudioEl)
  source.connect(deckGainNode)
  deckGainNode.connect(deckVolumeNode)
  deckVolumeNode.connect(panGainNode)
  panGainNode.connect(limiterNode)
  limiterNode.connect(analyserL)
  limiterNode.connect(masterNode)
  limiterNode.connect(analyserR)
}

function onCrossFade(value: number) {
  const deckAFadeGainNode = trackAFadeGain.value!
  const deckBFadeGainNode = trackBFadeGain.value!
  const mappedValue = mapRange(value, -1, 1, 0, 1)
  deckAFadeGainNode.gain.value = Math.cos(mappedValue * 0.5 * Math.PI)
  deckBFadeGainNode.gain.value = Math.cos((1.0 - mappedValue) * 0.5 * Math.PI)
}

function handleCrossFade(event: Event) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  crossFadeValue.value = value
  onCrossFade(value)
}

const setVolume = (node: GainNode, db: number) => {
  const audioContext = audioCtx.value!
  const gainValue = dbToLinearGain(db)
  node.gain.setValueAtTime(gainValue, audioContext.currentTime)
}

function onGainChange(event: Event) {
  const el = event.target as HTMLInputElement
  const inputValue = parseFloat(el.value)
  const [dBMin, dBMax] = getDbBounds(el)
  const db = faderToDB(inputValue, dBMin, dBMax)
  const deck = parseInt(el.dataset.deck!)
  switch (deck) {
    case 0:
      masterGainVal.value = inputValue
      setVolume(masterGain.value as GainNode, db)
      break
    case 1:
      trackAGainVal.value = inputValue
      setVolume(trackAGain.value as GainNode, db)
      break
    case 2:
      trackBGainVal.value = inputValue
      setVolume(trackBGain.value as GainNode, db)
      break
    case Number.NaN:
      console.warn('Deck not found')
      break
  }
}

function onDeckVolumeChange(event: Event) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  if (el.dataset.deck === '1') {
    trackAVolumeVal.value = value
    trackAVolumeGain.value!.gain.value = value
  } else {
    trackBVolumeVal.value = value
    trackBVolumeGain.value!.gain.value = value
  }
}

function resetDeckGain(deckNum: number) {
  switch (deckNum) {
    case 1:
      if (!trackAGain.value) return
      trackAGainVal.value = DECK_GAIN_DEFAULT_VALUE
      setVolume(trackAGain.value, 0)
      break
    case 2:
      if (!trackBGain.value) return
      trackBGainVal.value = DECK_GAIN_DEFAULT_VALUE
      setVolume(trackBGain.value, 0)
      break
  }
}

function getDbBounds(el: HTMLInputElement): [number, number] {
  const { minDb, maxDb } = el.dataset as { minDb: string; maxDb: string }
  const minDB = parseFloat(minDb)
  const maxDB = parseFloat(maxDb)
  return [minDB, maxDB]
}

const {
  start: startTrackAAnalyser,
  stop: stopTrackAAnalyser,
  channels: trackAChannels
} = useAudioLevelAnalyser(trackAAnalyserL, trackAAnalyserR)
const {
  start: startTrackBAnalyser,
  stop: stopTrackBAnalyser,
  channels: trackBChannels
} = useAudioLevelAnalyser(trackBAnalyserL, trackBAnalyserR)
const {
  start: startMasterAnalyser,
  stop: stopMasterAnalyser,
  channels: masterChannels
} = useAudioLevelAnalyser(masterAnalyserL, masterAnalyserR)

function onPlay(_: Event) {
  startTrackAAnalyser()
  startTrackBAnalyser()
  startMasterAnalyser()
}

function onPause(_: Event) {
  stopTrackAAnalyser()
  stopTrackBAnalyser()
  stopMasterAnalyser()
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-4xl grid-cols-[1fr,auto,auto] gap-2 p-2 md:p-4">
    <div class="flex flex-col gap-2">
      <fieldset class="flex flex-col p-2 md:p-8">
        <section class="grid gap-2 p-2 md:grid-cols-4 md:p-4">
          <div class="col-span-full flex flex-col justify-center gap-2">
            <div class="flex items-center justify-between gap-2">
              <h2 class="font-bold">Master Gain</h2>
              <output> {{ faderToDB(masterGainVal, -12, 12).toFixed() }}dB </output>
              <pre>
                {{ masterChannels }}
                {{ trackAChannels }}
                {{ trackBChannels }}
              </pre>
            </div>
            <div class="relative flex w-full flex-col gap-2">
              <input
                :data-deck="0"
                :data-max-db="12"
                :data-min-db="-12"
                :value="masterGainVal"
                class="w-full"
                max="1"
                min="0"
                step="0.01"
                type="range"
                @input="onGainChange" />
              <div class="flex justify-between">
                <span
                  class="text-muted-foreground whitespace-nowrap text-xs font-semibold tabular-nums">
                  -12dB
                </span>
                <span
                  class="text-muted-foreground whitespace-nowrap text-xs font-semibold tabular-nums">
                  +12dB
                </span>
              </div>
            </div>
            <Button
              :disabled="masterGainVal === MASTER_GAIN_DEFAULT_VALUE"
              class="w-fit"
              size="xs"
              variant="outline"
              @click="
                () => {
                  masterGainVal = MASTER_GAIN_DEFAULT_VALUE
                  setVolume(masterGain!, 0)
                }
              ">
              Reset
            </Button>
          </div>
        </section>

        <section class="grid gap-2 p-2 md:grid-cols-[1fr,auto,1fr] md:p-4">
          <section class="-2 grid grid-cols-2 gap-x-2 gap-y-4 p-2">
            <h2 class="col-span-full font-bold">Deck A</h2>
            <div class="col-span-full flex flex-col gap-2">
              <audio
                ref="trackASourceEl"
                controls
                data-deck="1"
                loop
                src="/assets/Serato/ScratchBeats/ScratchBeat3.mp3"
                @pause="onPause"
                @play="onPlay" />
            </div>
            <section class="dashed flex size-full flex-col gap-y-2 p-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex w-full items-center justify-between gap-2">
                  <h4 class="text-center text-sm font-semibold">Gain (A)</h4>
                  <output>{{ faderToDB(trackAGainVal, -24, 24).toFixed() }}dB</output>
                </div>
              </div>
              <div class="relative m-auto w-fit">
                <span
                  class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                  +24dB
                </span>
                <input
                  :value="trackAGainVal"
                  aria-orientation="vertical"
                  data-deck="1"
                  data-max-db="24"
                  data-min-db="-24"
                  max="1"
                  min="0"
                  step="0.01"
                  type="range"
                  @input="onGainChange" />
                <span
                  class="text-muted-foreground absolute bottom-2 left-8 whitespace-nowrap text-xs font-semibold tabular-nums">
                  -24dB
                </span>
              </div>
              <div class="flex flex-col items-center">
                <Button
                  :disabled="trackAGainVal === DECK_GAIN_DEFAULT_VALUE"
                  class="mr-auto"
                  size="xs"
                  variant="outline"
                  @click="resetDeckGain(1)">
                  Reset
                </Button>
              </div>
            </section>
            <section class="flex size-full flex-col gap-y-2">
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-center text-sm font-semibold">Volume (A)</h4>
                <output>{{ trackAVolumeVal }}</output>
              </div>
              <div class="grid place-items-center gap-2">
                <div class="relative flex flex-col items-center gap-2">
                  <span
                    class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                    1
                  </span>
                  <input
                    :value="trackAVolumeVal"
                    aria-orientation="vertical"
                    data-deck="1"
                    max="1"
                    min="0"
                    step="0.01"
                    type="range"
                    @input="onDeckVolumeChange" />
                  <span
                    class="text-muted-foreground absolute bottom-0 left-8 whitespace-nowrap text-xs font-semibold tabular-nums">
                    0
                  </span>
                </div>
                <div class="flex w-full flex-col items-start">
                  <Button
                    :disabled="trackAVolumeVal === DECK_VOLUME_DEFAULT_VALUE"
                    size="xs"
                    variant="outline"
                    @click="trackAVolumeVal = DECK_VOLUME_DEFAULT_VALUE">
                    Reset
                  </Button>
                </div>
              </div>
            </section>
          </section>
          <!--
        -- CrossFade
        -->
          <div class="flex flex-col items-center justify-center">
            <input
              :value="crossFadeValue"
              class="w-full"
              max="1"
              min="-1"
              step="0.001"
              type="range"
              @input="handleCrossFade" />
          </div>
          <!--
          -- Deck B
          -->
          <section class="grid grid-cols-2 gap-x-2 gap-y-4 p-2">
            <h3 class="col-span-full font-bold">Deck B</h3>
            <div class="col-span-full flex flex-col gap-2">
              <audio
                ref="trackBSourceEl"
                controls
                data-deck="2"
                loop
                src="/assets/Serato/ScratchBeats/ScratchBeat4.mp3"
                @pause="onPause"
                @play="onPlay" />
            </div>
            <section class="col-start-2 flex size-full flex-col gap-y-2 p-2">
              <div class="flex w-full items-center justify-between gap-2">
                <h4 class="text-center text-sm font-semibold">Gain (B)</h4>
                <output>{{ faderToDB(trackBGainVal, -24, 24).toFixed() }}dB</output>
              </div>
              <div class="relative m-auto w-fit">
                <span
                  class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                  +24dB
                </span>
                <input
                  :value="trackBGainVal"
                  aria-orientation="vertical"
                  data-deck="2"
                  data-max-db="24"
                  data-min-db="-24"
                  max="1"
                  min="0"
                  step="0.01"
                  type="range"
                  @input="onGainChange" />
                <span
                  class="text-muted-foreground absolute bottom-0 left-8 whitespace-nowrap text-xs font-semibold tabular-nums">
                  -24dB
                </span>
              </div>
              <div class="flex w-full flex-col items-start">
                <Button
                  :disabled="trackBGainVal === DECK_GAIN_DEFAULT_VALUE"
                  size="xs"
                  variant="outline"
                  @click="resetDeckGain(2)">
                  Reset
                </Button>
              </div>
            </section>
            <section class="row-start-3 flex size-full flex-col gap-y-2 p-2">
              <div class="flex w-full items-center justify-between gap-2">
                <h4 class="text-center text-sm font-semibold">Volume</h4>
                <output>{{ trackBVolumeVal }}</output>
              </div>
              <div class="grid place-items-center gap-2">
                <div class="relative flex flex-col items-center gap-2">
                  <span
                    class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                    1
                  </span>
                  <input
                    :value="trackBVolumeVal"
                    aria-orientation="vertical"
                    data-deck="2"
                    max="1"
                    min="0"
                    step="0.01"
                    type="range"
                    @input="onDeckVolumeChange" />
                  <span
                    class="text-muted-foreground absolute bottom-0 left-8 whitespace-nowrap text-xs font-semibold tabular-nums">
                    0
                  </span>
                </div>
                <div class="flex w-full flex-col items-start">
                  <Button
                    :disabled="trackBVolumeVal === DECK_VOLUME_DEFAULT_VALUE"
                    size="xs"
                    variant="outline"
                    @click="trackBVolumeVal = DECK_VOLUME_DEFAULT_VALUE">
                    Reset
                  </Button>
                </div>
              </div>
            </section>
          </section>
        </section>
      </fieldset>
    </div>
    <div class="col-span-full col-start-1">
      <!-- Panner -->
    </div>
  </div>
</template>

<style scoped>
input[type='range'][aria-orientation='vertical'] {
  writing-mode: vertical-rl;
  direction: rtl;
  width: 12px;
  height: 180px;
}
</style>
