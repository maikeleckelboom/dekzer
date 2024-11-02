<script lang="ts" setup>
import {
  DECK_GAIN_DEFAULT_VALUE,
  DECK_VOLUME_DEFAULT_VALUE,
  MASTER_GAIN_DEFAULT_VALUE
} from '~~/layers/fader/utils/constants'
import { cosineFadeIn, cosineFadeOut } from '~/utils/audio'

/**
 * Deck A: Gain -> Hi -> Mid -> Low -> FX -> Volume -> Pan -> Limiter ->
 *                                                                      | -> Master FX -> Master Limiter -> Master Output
 * Deck B: Gain -> Hi -> Mid -> Low -> FX -> Volume -> Pan -> Limiter ->
 */
const audioContext = shallowRef<AudioContext>()

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

// Track B
const trackBSourceEl = useTemplateRef<HTMLAudioElement>('trackBSourceEl')
const trackBGain = shallowRef<GainNode>()
const trackBGainVal = shallowRef<number>(DECK_GAIN_DEFAULT_VALUE)
const trackBVolumeVal = shallowRef<number>(DECK_VOLUME_DEFAULT_VALUE)
const trackBVolumeGain = shallowRef<GainNode>()
const trackBFadeGain = shallowRef<GainNode>()
const trackBLimiter = shallowRef<DynamicsCompressorNode>()
const trackBAnalyserL = shallowRef<AnalyserNode>()
const trackBAnalyserR = shallowRef<AnalyserNode>()

// Cross-fade
const crossFadeValue = shallowRef<number>(0)

onMounted(() => {
  // const context = new AudioContext({ latencyHint: 'playback' })
  // audioContext.value = context
  //
  // trackAGain.value = context.createGain()
  // trackAVolumeGain.value = context.createGain()
  // trackAAnalyserL.value = context.createAnalyser()
  // trackAAnalyserR.value = context.createAnalyser()
  // trackAFadeGain.value = context.createGain()
  // trackALimiter.value = createLimiter(context, 'track')
  //
  // trackBGain.value = context.createGain()
  // trackBVolumeGain.value = context.createGain()
  // trackBAnalyserL.value = context.createAnalyser()
  // trackBAnalyserR.value = context.createAnalyser()
  // trackBFadeGain.value = context.createGain()
  // trackBLimiter.value = createLimiter(context, 'track')
  //
  // masterGain.value = context.createGain()
  //
  // connectDeck(
  //   context,
  //   trackASourceEl.value,
  //   trackAGain.value,
  //   trackAVolumeGain.value,
  //   trackAAnalyserL.value,
  //   trackAAnalyserR.value,
  //   trackAFadeGain.value,
  //   trackALimiter.value,
  //   masterGain.value
  // )
  //
  // connectDeck(
  //   context,
  //   trackBSourceEl.value,
  //   trackBGain.value,
  //   trackBVolumeGain.value,
  //   trackBAnalyserL.value,
  //   trackBAnalyserR.value,
  //   trackBFadeGain.value,
  //   trackBLimiter.value,
  //   masterGain.value
  // )
  //
  // masterLimiter.value = createLimiter(context, 'master')
  // masterGain.value.connect(masterLimiter.value)
  //
  // masterAnalyserL.value = context.createAnalyser()
  // masterAnalyserR.value = context.createAnalyser()
  //
  // masterGain.value.connect(masterAnalyserL.value)
  // masterGain.value.connect(masterAnalyserR.value)
  //
  // masterLimiter.value.connect(context.destination)
})

function connectDeck(
  audioContext: AudioContext,
  deckAudioEl: HTMLMediaElement | null,
  dryGain: GainNode,
  deckVolumeNode: GainNode,
  analyserL: AnalyserNode,
  analyserR: AnalyserNode,
  panGainNode: GainNode,
  limiterNode: DynamicsCompressorNode,
  masterNode: GainNode
) {
  if (!deckAudioEl) return
  const source = audioContext.createMediaElementSource(deckAudioEl)
  source.connect(dryGain)
  dryGain.connect(deckVolumeNode)
  deckVolumeNode.connect(analyserL)
  deckVolumeNode.connect(analyserR)
  deckVolumeNode.connect(panGainNode)
  panGainNode.connect(limiterNode)
  limiterNode.connect(masterNode)
}

function onCrossFade(value: number) {
  const deckAFadeGainNode = trackAFadeGain.value!
  const deckBFadeGainNode = trackBFadeGain.value!
  const mappedValue = mapRange(value, -1, 1, 0, 1)
  deckAFadeGainNode.gain.value = cosineFadeIn(mappedValue)
  deckBFadeGainNode.gain.value = cosineFadeOut(mappedValue)
}

function handleCrossFade(event: Event) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  crossFadeValue.value = value
  onCrossFade(value)
}

const setVolume = (node: GainNode, dB: number) => {
  const context = audioContext.value!
  const gainValue = dbToLinearGain(dB)
  node.gain.setValueAtTime(gainValue, context.currentTime)
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

function onPlay(_: Event) {
}

function onPause(_: Event) {

}
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <!--  -->
    <section></section>
    <!-- Master Gain -->
    <section>
      <div>
        <h2>Master</h2>
        <div class="my-2">
        </div>
      </div>
      <div>
        <input
          :data-deck="0"
          :data-max-db="12"
          :data-min-db="-12"
          :value="masterGainVal"
          max="1"
          min="0"
          step="0.01"
          type="range"
          @input="onGainChange" />
        <Button
          :disabled="masterGainVal === MASTER_GAIN_DEFAULT_VALUE"
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
    <!-- Decks + CrossFade -->
    <section class="grid grid-cols-3 gap-2">
      <!-- Deck A -->
      <div>
        <div>
          <h2>Deck A</h2>
          <div class="my-2">
          </div>
          <audio
            ref="trackASourceEl"
            class="w-32"
            controls
            data-deck="1"
            loop
            src="/assets/YouTube/Turn%20off%20Your%20Brain.opus"
            @pause="onPause"
            @play="onPlay" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <section>
            <div>
              <p>Gain</p>
            </div>
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
            <Button
              :disabled="trackAGainVal === DECK_GAIN_DEFAULT_VALUE"
              class="mr-auto"
              size="xs"
              variant="outline"
              @click="resetDeckGain(1)">
              Reset
            </Button>
          </section>
          <section>
            <div>
              <p>Volume</p>
            </div>
            <div>
              <input
                :value="trackAVolumeVal"
                aria-orientation="vertical"
                data-deck="1"
                max="1"
                min="0"
                step="0.01"
                type="range"
                @input="onDeckVolumeChange" />

              <Button
                :disabled="trackAVolumeVal === DECK_VOLUME_DEFAULT_VALUE"
                size="xs"
                variant="outline"
                @click="trackAVolumeVal = DECK_VOLUME_DEFAULT_VALUE">
                Reset
              </Button>
            </div>
          </section>
        </div>
      </div>
      <!-- CrossFade -->
      <div class="grid place-items-center">
        <input
          :value="crossFadeValue"
          class="max-w-20"
          max="1"
          min="-1"
          step="0.001"
          type="range"
          @input="handleCrossFade" />
      </div>
      <!-- Deck B -->
      <div>
        <div>
          <h2>Deck B</h2>
        </div>
        <div class="my-2">
        </div>
        <div>
          <audio
            ref="trackBSourceEl"
            class="w-32"
            controls
            data-deck="2"
            loop
            src="/assets/YouTube/Go%20Get%20Busy%20(Hardcore%20Edit).opus"
            @pause="onPause"
            @play="onPlay" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <section>
            <div>
              <h3>Gain</h3>
            </div>
            <div>
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
              <Button
                :disabled="trackBGainVal === DECK_GAIN_DEFAULT_VALUE"
                size="xs"
                variant="outline"
                @click="resetDeckGain(2)">
                Reset
              </Button>
            </div>
          </section>
          <section>
            <div>
              <h4>Volume</h4>
            </div>
            <div>
              <input
                :value="trackBVolumeVal"
                aria-orientation="vertical"
                data-deck="2"
                max="1"
                min="0"
                step="0.01"
                type="range"
                @input="onDeckVolumeChange" />
              <Button
                :disabled="trackBVolumeVal === DECK_VOLUME_DEFAULT_VALUE"
                size="xs"
                variant="outline"
                @click="trackBVolumeVal = DECK_VOLUME_DEFAULT_VALUE">
                Reset
              </Button>
            </div>
          </section>
        </div>
      </div>
    </section>
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
