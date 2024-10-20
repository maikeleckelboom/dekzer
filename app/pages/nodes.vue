<script lang="ts" setup>
const masterGainNode = ref<GainNode>()
const deck1GainNode = ref<GainNode>()
const deck2GainNode = ref<GainNode>()

const DEFAULT_MASTER_GAIN: number = 0.625 as const /* +3dB */
const DEFAULT_DECK_GAIN: number = 0.5 as const /* 0dB */

const masterGainValue = ref<number>(DEFAULT_MASTER_GAIN)
const deck1GainValue = ref<number>(DEFAULT_DECK_GAIN)
const deck2GainValue = ref<number>(DEFAULT_DECK_GAIN)
const audioCtx = shallowRef<AudioContext>()
const deck1AudioEl = useTemplateRef<HTMLAudioElement>('deck1AudioEl')
const deck2AudioEl = useTemplateRef<HTMLAudioElement>('deck2AudioEl')

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

  masterGain.connect(audioContext.destination)
  deck1Gain.connect(masterGain)
  deck2Gain.connect(masterGain)

  const deck1AudioElement = deck1AudioEl.value
  if (deck1AudioElement) {
    const source = audioContext.createMediaElementSource(deck1AudioElement)
    source.connect(deck1Gain)
  }

  const deck2AudioElement = deck2AudioEl.value
  if (deck2AudioElement) {
    const source = audioContext.createMediaElementSource(deck2AudioElement)
    source.connect(deck2Gain)
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

const masterGainDB = computed(() => faderToDB(masterGainValue.value, -12, 12).toFixed())
const deck1GainDB = computed(() => faderToDB(deck1GainValue.value, -24, 24).toFixed())
const deck2GainDB = computed(() => faderToDB(deck2GainValue.value, -24, 24).toFixed())

function resetDeckGain(deck: number) {
  if (deck === 1) {
    deck1GainValue.value = DEFAULT_DECK_GAIN
    setVolume(deck1GainNode.value!, 0)
  } else {
    deck2GainValue.value = DEFAULT_DECK_GAIN
    setVolume(deck2GainNode.value!, 0)
  }
}

function resetMasterGain() {
  masterGainValue.value = DEFAULT_MASTER_GAIN
  setVolume(masterGainNode.value!, 0)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-4  p-12">
    <div class="bg-muted/50 grid grid-cols-4 p-4 gap-x-2 border-2">
      <div class="col-span-full flex flex-col items-center justify-center gap-2 p-8">
        <div class="flex flex-col items-center gap-1">
          <h2 class="text-center text-lg font-bold">Master Gain</h2>
          <span class="text-muted-foreground leading-none">(default: +3dB)</span>
          <Button
            :disabled="masterGainValue === DEFAULT_MASTER_GAIN"
            class="mt-4"
            size="xs"
            variant="outline"
            @click="resetMasterGain">
            Reset
          </Button>
        </div>
        <div class="space-x-2">
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
            <span class="whitespace-nowrap text-sm font-semibold tabular-nums"> -12dB </span>
            <span class="whitespace-nowrap text-sm font-semibold tabular-nums"> +12dB </span>
          </div>
        </div>
      </div>
      <div
        class="bg-muted/50 col-span-full flex flex-col items-center gap-2 border p-8 md:col-span-2">
        <div class="flex flex-col items-center gap-1">
          <h2 class="text-center text-lg font-bold">Deck 1 Gain</h2>
          <span class="text-muted-foreground leading-none">(default: +0dB)</span>
          <Button
            :disabled="deck1GainValue === DEFAULT_DECK_GAIN"
            class="mt-4"
            size="xs"
            variant="outline"
            @click="resetDeckGain(1)">
            Reset
          </Button>
        </div>
        <div class="space-x-2">
          <output>{{ deck1GainDB }}dB</output>
        </div>
        <div class="relative flex flex-col items-center gap-2">
          <span
            class="absolute left-8 top-0 whitespace-nowrap text-sm font-semibold tabular-nums">
            -24dB
          </span>
          <input
            ref="deckGain"
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
            class="absolute bottom-0 left-8 whitespace-nowrap text-sm font-semibold tabular-nums">
            +24dB
          </span>
        </div>
        <audio
          id="deck1"
          ref="deck1AudioEl"
          controls
          data-deck="1"
          loop
          src="/assets/audio3.wav" />
      </div>
      <div
        class="bg-muted/50 col-span-full flex flex-col items-center gap-2 border p-8 md:col-span-2">
        <div class="flex flex-col items-center gap-1">
          <h2 class="text-center text-lg font-bold">Deck 2 Gain</h2>
          <span class="text-muted-foreground leading-none">(default: +0dB)</span>
          <Button
            :disabled="deck2GainValue === DEFAULT_DECK_GAIN"
            class="mt-4"
            size="xs"
            variant="outline"
            @click="resetDeckGain(2)">
            Reset
          </Button>
        </div>
        <div class="space-x-2">
          <output>{{ deck2GainDB }}dB</output>
        </div>
        <div class="relative">
          <span
            class="absolute left-8 top-0 whitespace-nowrap text-sm font-semibold tabular-nums">
            -24dB
          </span>
          <input
            ref="deckGain"
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
            class="absolute bottom-0 left-8 whitespace-nowrap text-sm font-semibold tabular-nums">
            +24dB
          </span>
        </div>
        <audio
          ref="deck2AudioEl"
          controls
          data-deck="2"
          loop
          src="/assets/audio.wav" />
      </div>
    </div>
    <div></div>
  </div>
</template>

<style scoped>
input[type='range'][aria-orientation='vertical'] {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 12px;
  height: 180px;
}
</style>
