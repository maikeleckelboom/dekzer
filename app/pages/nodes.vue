<script lang="ts" setup>
const MASTER_GAIN_DEFAULT: number = /* +3dB */ 0.625 as const
const DECK_GAIN_DEFAULT: number = /* 0dB */ 0.5 as const
const VOLUME_FADER_DEFAULT: number = /* 100% */ 1 as const

const masterGainNode = shallowRef<GainNode>()
const deck1GainNode = shallowRef<GainNode>()
const deck2GainNode = shallowRef<GainNode>()
const deck1VolumeNode = shallowRef<GainNode>()
const deck2VolumeNode = shallowRef<GainNode>()

const masterGainValue = shallowRef<number>(MASTER_GAIN_DEFAULT)
const deck1GainValue = shallowRef<number>(DECK_GAIN_DEFAULT)
const deck2GainValue = shallowRef<number>(DECK_GAIN_DEFAULT)

const deck1VolumeValue = shallowRef<number>(VOLUME_FADER_DEFAULT)
const deck2VolumeValue = shallowRef<number>(VOLUME_FADER_DEFAULT)

const audioCtx = shallowRef<AudioContext>()

const deck1Audio = useTemplateRef<HTMLAudioElement>('deck1Audio')
const deck2Audio = useTemplateRef<HTMLAudioElement>('deck2Audio')

onMounted(() => {
  const audioContext = new AudioContext()
  audioCtx.value = audioContext

  masterGainNode.value = audioContext.createGain()
  deck1GainNode.value = audioContext.createGain()
  deck2GainNode.value = audioContext.createGain()

  const masterGain = masterGainNode.value
  const deck1Gain = deck1GainNode.value
  const deck2Gain = deck2GainNode.value

  masterGain.gain.value = masterGainValue.value
  deck1Gain.gain.value = deck1GainValue.value
  deck2Gain.gain.value = deck2GainValue.value

  deck1VolumeNode.value = audioContext.createGain()
  deck2VolumeNode.value = audioContext.createGain()

  const deck1Volume = deck1VolumeNode.value
  const deck2Volume = deck2VolumeNode.value

  // ...
  // ...
  // ...
  // ___________________________________________________________

  const deck1AudioEl = deck1Audio.value
  if (deck1AudioEl) {
    const source = audioContext.createMediaElementSource(deck1AudioEl)
    source.connect(deck1Gain)
    deck1Gain.connect(deck1Volume)
    deck1Volume.connect(masterGain)
    masterGain.connect(audioContext.destination)
  }

  const deck2AudioEl = deck2Audio.value
  if (deck2AudioEl) {
    const source = audioContext.createMediaElementSource(deck2AudioEl)
    source.connect(deck2Gain)
    source.connect(deck2Gain)
    deck2Gain.connect(deck2Volume)
    deck2Volume.connect(masterGain)
    masterGain.connect(audioContext.destination)
  }
})

function faderToDB(value: number, minDB: number, maxDB: number): number {
  const normalizedValue = (value - 0.5) * 2
  return (normalizedValue * (maxDB - minDB)) / 2
}

function getDbBounds(el: HTMLInputElement): [number, number] {
  const minDB = parseFloat(el.dataset.minDb)
  const maxDB = parseFloat(el.dataset.maxDb)
  return [minDB, maxDB]
}

function dbToLinearGain(db: number): number {
  return Math.pow(10, db / 20)
}

const setVolume = (node: GainNode, db: number) => {
  const audioContext = audioCtx.value!
  const gainValue = dbToLinearGain(db)
  node.gain.setValueAtTime(gainValue, audioContext.currentTime)
}

function onGainChange(event: InputEvent) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  const [minDB, maxDB] = getDbBounds(el)
  const db = faderToDB(value, minDB, maxDB)
  if (el.dataset.deck === '1') {
    deck1GainValue.value = value
    setVolume(deck1GainNode.value!, db)
  } else if (el.dataset.deck === '2') {
    deck2GainValue.value = value
    setVolume(deck2GainNode.value!, db)
  } else {
    masterGainValue.value = value
    setVolume(masterGainNode.value!, db)
  }
}

function resetDeckGain(deck: number) {
  if (deck === 1) {
    deck1GainValue.value = DECK_GAIN_DEFAULT
    setVolume(deck1GainNode.value!, 0)
  } else {
    deck2GainValue.value = DECK_GAIN_DEFAULT
    setVolume(deck2GainNode.value!, 0)
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

const masterGainDB = computed(() => faderToDB(masterGainValue.value, -12, 12).toFixed())
const deck1GainDB = computed(() => faderToDB(deck1GainValue.value, -24, 24).toFixed())
const deck2GainDB = computed(() => faderToDB(deck2GainValue.value, -24, 24).toFixed())
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-4 p-2 md:p-12">
    <fieldset class="flex flex-col border-4 p-2 md:p-8">
      <legend class=" text-3xl font-bold tracking-tight">
        Gain Nodes
      </legend>
      <!-- Master Gain -->
      <section class="grid gap-2 p-2 md:grid-cols-4 md:p-4">
        <div class="col-span-full flex flex-col items-center justify-center gap-2">

          <div class="flex items-center gap-2">
            <h2 class="text-center text-lg font-bold">Master Gain</h2>
            <output>{{ masterGainDB }}dB</output>
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
              <span class="whitespace-nowrap text-sm font-semibold tabular-nums opacity-75">
                -12dB
              </span>
              <span class="whitespace-nowrap text-sm font-semibold tabular-nums opacity-75">
                +12dB
              </span>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <Button
              :disabled="masterGainValue === MASTER_GAIN_DEFAULT"
              class="mt-3"
              size="xs"
              variant="outline"
              @click="masterGainValue = MASTER_GAIN_DEFAULT">
              Reset
            </Button>
          </div>
        </div>
      </section>

      <!-- Deck Gain 1 & 2 -->
      <section class="grid gap-4 p-2 md:grid-cols-2 md:p-4">
        <h1 class="col-span-full hidden text-4xl font-bold">Decks</h1>
        <!-- Deck 1 -->
        <section class="grid grid-cols-2 gap-x-2 gap-y-4 border-2 bg-gray-400/10 p-4">
          <h2 class="col-span-full text-center text-2xl font-bold">Deck 1</h2>
          <section
            class="bg-background/35 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
            <div class="flex items-center justify-between gap-2 px-2">
              <div class="flex w-full items-center justify-between gap-2 px-2">
                <h4 class="text-center text-lg font-semibold">Gain</h4>
                <output>{{ deck1GainDB > 0 ? '+' : '' }}{{ deck1GainDB }}dB</output>
              </div>
            </div>
            <div class="relative m-auto w-fit">
              <span
                class="absolute -top-1 left-6 whitespace-nowrap text-sm font-semibold tabular-nums">
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
                class="absolute bottom-1 left-6 whitespace-nowrap text-sm font-semibold tabular-nums">
                -24dB
              </span>
            </div>
            <div class="flex flex-col items-center">
              <Button
                :disabled="deck1GainValue === DECK_GAIN_DEFAULT"
                class="mt-3"
                size="xs"
                variant="outline"
                @click="resetDeckGain(1)">
                Reset
              </Button>
            </div>
          </section>
          <section
            class="bg-background/35 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
            <div class="flex items-center justify-between gap-2 px-2">
              <h4 class="text-center text-lg font-semibold">Volume</h4>
              <output>{{ deck1VolumeValue }}</output>
            </div>
            <div class="grid place-items-center gap-4">
              <div class="relative flex flex-col items-center gap-2">
                <span
                  class="absolute left-8 top-0 whitespace-nowrap text-sm font-semibold tabular-nums">
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
                  class="absolute bottom-0 left-8 whitespace-nowrap text-sm font-semibold tabular-nums">
                  0
                </span>
              </div>
              <div class="flex flex-col items-center">
                <Button
                  :disabled="deck1VolumeValue === VOLUME_FADER_DEFAULT"
                  class="mt-3"
                  size="xs"
                  variant="outline"
                  @click="deck1VolumeValue = VOLUME_FADER_DEFAULT">
                  Reset
                </Button>
              </div>
            </div>
          </section>
          <div class="col-span-full flex flex-col items-center gap-2">
            <h2 class="text-center text-lg font-bold">Audio Source</h2>
            <audio
              ref="deck1Audio"
              controls
              data-deck="1"
              loop
              src="/assets/audio2.wav" />
          </div>
        </section>
        <!-- Deck 2 -->
        <section class="grid grid-cols-2 gap-x-2 gap-y-4 border bg-gray-400/10 p-4">
          <h3 class="col-span-full text-center text-2xl font-bold">Deck 2</h3>

          <section
            class="bg-background/35 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
            <div class="flex w-full items-center justify-between gap-2 px-2">
              <h4 class="text-center text-lg font-semibold">Gain</h4>
              <output>{{ deck2GainDB > 0 ? '+' : '' }}{{ deck2GainDB }}dB</output>
            </div>
            <div class="relative m-auto w-fit">
              <span
                class="absolute -top-1 left-6 whitespace-nowrap text-sm font-semibold tabular-nums">
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
                class="absolute bottom-1 left-6 whitespace-nowrap text-sm font-semibold tabular-nums">
                -24dB
              </span>
            </div>
            <div class="flex flex-col items-center">
              <Button
                :disabled="deck2GainValue === DECK_GAIN_DEFAULT"
                class="mt-3"
                size="xs"
                variant="outline"
                @click="resetDeckGain(2)">
                Reset
              </Button>
            </div>
          </section>
          <section
            class="bg-background/35 flex size-full flex-col gap-y-2 border-2 border-dashed p-2">
            <div class="flex w-full items-center justify-between gap-2 px-2">
              <h4 class="text-center text-lg font-semibold">Volume</h4>
              <output>{{ deck2VolumeValue }}</output>
            </div>
            <div class="grid place-items-center gap-4">
              <div class="relative flex flex-col items-center gap-2">
                <span
                  class="absolute left-8 top-0 whitespace-nowrap text-sm font-semibold tabular-nums">
                  1
                </span>
                <input
                  ref="deck2Volume"
                  :value="deck2VolumeValue"
                  aria-orientation="vertical"
                  data-deck="2"
                  max="1"
                  min="0"
                  step="0.01"
                  type="range"
                  @input="onDeckVolumeChange" />
                <span
                  class="absolute bottom-0 left-8 whitespace-nowrap text-sm font-semibold tabular-nums">
                  0
                </span>
              </div>
              <div class="flex flex-col items-center">
                <Button
                  :disabled="deck2VolumeValue === VOLUME_FADER_DEFAULT"
                  class="mt-3"
                  size="xs"
                  variant="outline"
                  @click="deck2VolumeValue = VOLUME_FADER_DEFAULT">
                  Reset
                </Button>
              </div>
            </div>
          </section>
          <div class="col-span-full flex flex-col items-center gap-2">
            <h2 class="text-center text-lg font-bold">Audio Source</h2>
            <audio
              ref="deck2Audio"
              controls
              data-deck="2"
              loop
              src="/assets/audio3.wav" />
          </div>
        </section>
      </section>
    </fieldset>
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
