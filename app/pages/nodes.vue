<script lang="ts" setup>
const masterGainNode = ref<GainNode>()
const deck1GainNode = ref<GainNode>()
const deck2GainNode = ref<GainNode>()

const masterGainValue = ref<number>(0.5)
const deck1GainValue = ref<number>(0.75)
const deck2GainValue = ref<number>(0.75)

onMounted(() => {
  const audioContext = new AudioContext()
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
})

function faderToDB(value: number, minDB: number, maxDB: number): number {
  const normalizedValue = (value - 0.5) * 2
  return (normalizedValue * (maxDB - minDB)) / 2
}

function dBToFader(dBValue: number, minDB: number, maxDB: number): number {
  const normalizedValue = dBValue / (maxDB - minDB)
  return (normalizedValue / 2) + 0.5
}

watch(masterGainValue, (inputValue: number) => {
  if (!masterGainNode.value) return
  const dBValue = faderToDB(inputValue, -12, 12)
  const gainValue = dBToFader(dBValue, -12, 12)
  console.log('inputValue', inputValue, 'gainValue', gainValue, 'dBValue', dBValue)
  masterGainNode.value.gain.value = inputValue
})

watch(deck1GainValue, (inputValue: number) => {
  if (!deck1GainNode.value) return
  const dBValue = faderToDB(inputValue, -24, 24)
  const gainValue = dBToFader(dBValue, -24, 24)
  console.log('inputValue', inputValue, 'gainValue', gainValue, 'dBValue', dBValue)
  deck1GainNode.value.gain.value = gainValue
})

watch(deck2GainValue, (inputValue: number) => {
  if (!deck2GainNode.value) return
  const dBValue = faderToDB(inputValue, -24, 24)
  const gainValue = dBToFader(dBValue, -24, 24)
  console.log('inputValue', inputValue, 'gainValue', gainValue, 'dBValue', dBValue)
  deck2GainNode.value.gain.value = gainValue
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col gap-4">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">Nodes Test Ground</h1>
    </div>
    <div class="grid grid-cols-3 grid-rows-3 gap-4">
      <div class="col-span-full flex flex-col gap-2">
        <h2 class="text-lg font-bold">Master Gain Node</h2>
        <div>
          <label for="masterGain">Master Gain</label>
          <input
            id="masterGain"
            v-model.number="masterGainValue"
            max="1"
            min="0"
            step="0.01"
            type="range" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-bold">Deck 1 Gain Node</h2>
        <div>
          <label for="deck1Gain">Deck 1 Gain</label>
          <input
            id="deck1Gain"
            v-model.number="deck1GainValue"
            max="1"
            min="0"
            step="0.01"
            type="range" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-bold">Deck 2 Gain Node</h2>
        <div>
          <label for="deck2Gain">Deck 2 Gain</label>
          <input
            id="deck2Gain"
            v-model.number="deck2GainValue"
            max="24"
            min="-24"
            step="0.01"
            type="range" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
