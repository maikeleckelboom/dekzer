<script lang="ts" setup>
// @ts-nocheck

import {
  DECK_GAIN_DEFAULT_VALUE,
  DECK_VOLUME_DEFAULT_VALUE,
  MASTER_GAIN_DEFAULT_VALUE
} from '~~/layers/fader/utils/constants'

const masterGainNode = shallowRef<GainNode>()
const deck1GainNode = shallowRef<GainNode>()
const deck2GainNode = shallowRef<GainNode>()

const deck1VolumeNode = shallowRef<GainNode>()
const deck2VolumeNode = shallowRef<GainNode>()

const masterGainValue = shallowRef<number>(MASTER_GAIN_DEFAULT_VALUE)

const deck1GainValue = shallowRef<number>(DECK_GAIN_DEFAULT_VALUE)
const deck2GainValue = shallowRef<number>(DECK_GAIN_DEFAULT_VALUE)

const deck1VolumeValue = shallowRef<number>(DECK_VOLUME_DEFAULT_VALUE)
const deck2VolumeValue = shallowRef<number>(DECK_VOLUME_DEFAULT_VALUE)

const audioCtx = shallowRef<AudioContext>()

const deck1Audio = useTemplateRef<HTMLAudioElement>('deck1Audio')
const deck2Audio = useTemplateRef<HTMLAudioElement>('deck2Audio')

function connectDeck(
  audioContext: AudioContext,
  deckAudioEl: HTMLMediaElement | null,
  deckGainNode: GainNode,
  deckVolumeNode: GainNode,
  panGainNode: GainNode,
  masterNode: GainNode
) {
  if (!deckAudioEl) return
  const source = audioContext.createMediaElementSource(deckAudioEl)
  source.connect(deckGainNode)
  deckGainNode.connect(deckVolumeNode)
  deckVolumeNode.connect(panGainNode)
  panGainNode.connect(masterNode)
}

function getDbBounds(el: HTMLInputElement): [number, number] {
  const minDB = parseFloat(el.dataset.minDb)
  const maxDB = parseFloat(el.dataset.maxDb)
  return [minDB, maxDB]
}

const setVolume = (node: GainNode, db: number) => {
  const audioContext = audioCtx.value!
  const gainValue = dbToLinearGain(db)

  console.log('node', node)
  console.log('db', db)
  console.log('gainValue', gainValue)

  const gainDefaultValue = node.gain?.defaultValue

  console.log('gainDefaultValue', gainDefaultValue)

  // if (gainValue < 0.0001) {
  //   node.gain.setValueAtTime(0.0001, audioContext.currentTime)
  //   return
  // }
  node.gain.setValueAtTime(gainValue, audioContext.currentTime)
}

function onGainChange(event: InputEvent) {
  const el = event.target as HTMLInputElement
  const inputValue = parseFloat(el.value)

  const [dBMin, dBMax] = getDbBounds(el)

  const db = faderToDB(inputValue, dBMin, dBMax)
  const deck = parseInt(el.dataset.deck)


  switch (deck) {
    case 1:
      deck1GainValue.value = inputValue
      setVolume(deck1GainNode.value, db)
      break
    case 2:
      deck2GainValue.value = inputValue
      setVolume(deck2GainNode.value, db)
      break
    default:
      masterGainValue.value = inputValue
      setVolume(masterGainNode.value, db)
  }
}

function resetDeckGain(deckNum: number) {
  switch (deckNum) {
    case 1:
      const deck1Gain = unref(deck1GainNode)!
      deck1GainValue.value = DECK_GAIN_DEFAULT_VALUE
      setVolume(deck1Gain, 0)
      break
    case 2:
      const deck2Gain = unref(deck2GainNode)!
      deck2GainValue.value = DECK_GAIN_DEFAULT_VALUE
      setVolume(deck2Gain, 0)
      break
  }
}

function onDeckVolumeChange(event: InputEvent) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  if (el.dataset.deck === '1') {
    deck1VolumeValue.value = value
    deck1VolumeNode.value!.gain.value = value
  } else {
    deck2VolumeValue.value = value
    deck2VolumeNode.value!.gain.value = value
  }
}

const masterGainDisplay = computed(() => faderToDB(masterGainValue.value, -12, 12).toFixed())
const deckGainDisplay = computed(() => faderToDB(deck1GainValue.value, -24, 24).toFixed())
const deck2GainDB = computed(() => faderToDB(deck2GainValue.value, -24, 24).toFixed())

const pannerValue = ref(0)
const deckAFadeGain = ref<GainNode>()
const deckBFadeGain = ref<GainNode>()

onMounted(() => {
  const audioContext = new AudioContext()
  audioCtx.value = audioContext

  deck1GainNode.value = audioContext.createGain()
  deck2GainNode.value = audioContext.createGain()
  deck1VolumeNode.value = audioContext.createGain()
  deck2VolumeNode.value = audioContext.createGain()
  masterGainNode.value = audioContext.createGain()

  deck1GainNode.value.gain.value = deck1GainValue.value
  deck2GainNode.value.gain.value = deck2GainValue.value
  deck1VolumeNode.value.gain.value = deck1VolumeValue.value
  deck2VolumeNode.value.gain.value = deck2VolumeValue.value
  masterGainNode.value.gain.value = masterGainValue.value

  deckAFadeGain.value = audioContext.createGain()
  deckBFadeGain.value = audioContext.createGain()

  connectDeck(
    audioContext,
    deck1Audio.value,
    deck1GainNode.value,
    deck1VolumeNode.value,
    deckAFadeGain.value,
    masterGainNode.value
  )
  connectDeck(
    audioContext,
    deck2Audio.value,
    deck2GainNode.value,
    deck2VolumeNode.value,
    deckBFadeGain.value,
    masterGainNode.value
  )

  // connect m
  masterGainNode.value.connect(audioContext.destination)

  // Set initial volume
  setVolume(masterGainNode.value, 3)
  setVolume(deck1GainNode.value, 0)
  setVolume(deck2GainNode.value, 0)
  setVolume(deck1VolumeNode.value, deck1VolumeValue.value)
  setVolume(deck2VolumeNode.value, deck2VolumeValue.value)

})

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

function onCrossFade(value: number) {
  const deckAFadeGainNode = deckAFadeGain.value!
  const deckBFadeGainNode = deckBFadeGain.value!
  const mappedValue = mapRange(value, -1, 1, 0, 1)
  deckAFadeGainNode.gain.value = Math.cos(mappedValue * 0.5 * Math.PI)
  deckBFadeGainNode.gain.value = Math.cos((1.0 - mappedValue) * 0.5 * Math.PI)
}

function onPannerChange(event: InputEvent) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  pannerValue.value = value
  onCrossFade(value)
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-7xl grid-cols-[1fr,auto,auto] gap-8 p-2 md:p-4">
    <div class="flex flex-col gap-4">
      <fieldset class="flex flex-col border-4 p-2 md:p-8">
        <legend class="text-3xl font-bold tracking-tight">Gain Nodes</legend>
        <!-- Master Gain -->
        <section class="grid gap-2 p-2 md:grid-cols-4 md:p-4">
          <div class="col-span-full flex flex-col justify-center gap-2">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-lg font-bold">Master Gain</h2>
              <output>{{ masterGainDisplay }}dB</output>
            </div>

            <div class="relative flex w-full flex-col gap-2">
              <input
                ref="masterGain"
                :value="masterGainValue"
                class="w-full"
                data-max-db="12"
                data-min-db="-12"
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
              :disabled="masterGainValue === MASTER_GAIN_DEFAULT_VALUE"
              class="w-fit"
              size="xs"
              variant="outline"
              @click="masterGainValue = MASTER_GAIN_DEFAULT_VALUE">
              Reset
            </Button>
          </div>
        </section>

        <!-- Deck Gain 1 & 2 -->
        <section class="grid gap-4 p-2 md:grid-cols-[1fr,auto,1fr] md:p-4">
          <!-- Deck 1 -->
          <section class="grid grid-cols-2 gap-x-2 gap-y-4 border-2 bg-gray-400/10 p-2">
            <h2 class="col-span-full text-2xl font-bold">Deck 1</h2>
            <div class="col-span-full flex flex-col gap-2">
              <audio
                ref="deck1Audio"
                controls
                data-deck="1"
                loop
                src="/assets/YouTube/Go%20Get%20Busy%20(Hardcore%20Edit).opus" />
            </div>
            <section
              class="bg-background/35 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex w-full items-center justify-between gap-2">
                  <h4 class="text-center text-lg font-semibold">Gain</h4>
                  <output>{{ deckGainDisplay > 0 ? '+' : '' }}{{ deckGainDisplay }}dB</output>
                </div>
              </div>
              <div class="relative m-auto w-fit">
                <span
                  class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                  +24dB
                </span>
                <input
                  :value="deck1GainValue"
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
                  :disabled="deck1GainValue === DECK_GAIN_DEFAULT_VALUE"
                  class="mr-auto"
                  size="xs"
                  variant="outline"
                  @click="resetDeckGain(1)">
                  Reset
                </Button>
              </div>
            </section>
            <section
              class="bg-background/35 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-center text-lg font-semibold">Volume</h4>
                <output>{{ deck1VolumeValue }}</output>
              </div>
              <div class="grid place-items-center gap-4">
                <div class="relative flex flex-col items-center gap-2">
                  <span
                    class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                    1
                  </span>
                  <input
                    :value="deck1VolumeValue"
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
                    :disabled="deck1VolumeValue === DECK_VOLUME_DEFAULT_VALUE"
                    size="xs"
                    variant="outline"
                    @click="deck1VolumeValue = DECK_VOLUME_DEFAULT_VALUE">
                    Reset
                  </Button>
                </div>
              </div>
            </section>
          </section>
          <!-- CrossFade -->
          <div class="flex flex-col gap-4">
            <fieldset class="flex flex-col border-4 p-4">
              <legend class="text-2xl font-bold tracking-tight">Panner</legend>
              <input
                :value="pannerValue"
                class="w-full"
                max="1"
                min="-1"
                step="0.01"
                type="range"
                @input="onPannerChange" />
            </fieldset>
          </div>
          <!-- Deck 2 -->
          <section class="grid grid-cols-2 gap-x-2 gap-y-4 border bg-gray-400/10 p-2">
            <h3 class="col-span-full text-2xl font-bold">Deck 2</h3>
            <div class="col-span-full flex flex-col gap-2">
              <audio
                ref="deck2Audio"
                controls
                data-deck="2"
                loop
                src="/assets/YouTube/Turn%20off%20Your%20Brain.opus"
              />
            </div>
            <section
              class="bg-background/35 col-start-2 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
              <div class="flex w-full items-center justify-between gap-2">
                <h4 class="text-center text-lg font-semibold">Gain</h4>
                <output>{{ deck2GainDB > 0 ? '+' : '' }}{{ deck2GainDB }}dB</output>
              </div>
              <div class="relative m-auto w-fit">
                <span
                  class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                  +24dB
                </span>
                <input
                  :value="deck2GainValue"
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
                  :disabled="deck2GainValue === DECK_GAIN_DEFAULT_VALUE"
                  size="xs"
                  variant="outline"
                  @click="resetDeckGain(2)">
                  Reset
                </Button>
              </div>
            </section>
            <section
              class="bg-background/35 row-start-3 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
              <div class="flex w-full items-center justify-between gap-2">
                <h4 class="text-center text-lg font-semibold">Volume</h4>
                <output>{{ deck2VolumeValue }}</output>
              </div>
              <div class="grid place-items-center gap-4">
                <div class="relative flex flex-col items-center gap-2">
                  <span
                    class="text-muted-foreground absolute left-8 top-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                    1
                  </span>
                  <input
                    :value="deck2VolumeValue"
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
                    :disabled="deck2VolumeValue === DECK_VOLUME_DEFAULT_VALUE"
                    size="xs"
                    variant="outline"
                    @click="deck2VolumeValue = DECK_VOLUME_DEFAULT_VALUE">
                    Reset
                  </Button>
                </div>
              </div>
            </section>
          </section>
        </section>
      </fieldset>
    </div>
    <div class="col-span-full flex flex-col gap-4">
      <fieldset class="flex flex-col border-4 p-4">
        <legend class="text-2xl font-bold tracking-tight">Values</legend>
        <!-- Master Gain -->
        <!-- Deck Gain 1 & 2 -->
        <!-- Deck Volume 1 & 2 -->
        <section>
          <!-- boring small list -->
          <ul class="grid gap-4 md:grid-cols-2">
            <li class="col-span-full flex flex-col">
              <h2 class="text-sm font-bold">Master Gain</h2>
              <output> {{ masterGainDisplay >= 0 ? '+' : '' }}{{ masterGainDisplay }}dB</output>
            </li>
            <li class="flex flex-col gap-2">
              <h2 class="text-sm font-bold">Deck 1 Gain</h2>
              <output>{{ deckGainDisplay >= 0 ? '+' : '' }}{{ deckGainDisplay }}dB</output>
            </li>

            <li class="flex flex-col gap-2">
              <h2 class="text-sm font-bold">Deck 1 Volume</h2>
              <output>{{ deck1VolumeValue }}</output>
            </li>
            <li class="flex flex-col gap-2">
              <h2 class="text-sm font-bold">Deck 2 Gain</h2>
              <output>{{ deck2GainDB >= 0 ? '+' : '' }}{{ deck2GainDB }}dB</output>
            </li>
            <li class="flex flex-col gap-2">
              <h2 class="text-sm font-bold">Deck 2 Volume</h2>
              <output>{{ deck2VolumeValue }}</output>
            </li>
            <!-- Cross-fade Gains -->
            <li class="flex flex-col gap-2">
              <h2 class="text-sm font-bold">Panner</h2>
              <output>{{ pannerValue }}</output>
            </li>
          </ul>
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
