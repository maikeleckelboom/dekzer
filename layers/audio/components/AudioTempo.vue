<script setup lang="ts">
const { bpm } = defineProps<{ bpm: number }>()

const tempo = shallowRef<number>(bpm)

const tempoRange = shallowRef<8 | 16 | 50>(8)

const tempoPercentage = computed({
  get: () => tempo.value ?? 0,
  set: (value: number) => {
    tempo.value = value ?? 0
  }
})

function getTempoRangeMinMax(originalBpm: number, bpmRange: 8 | 16 | 50) {
  const min = originalBpm - originalBpm * (bpmRange / 100)
  const max = originalBpm + originalBpm * (bpmRange / 100)
  return { min, max }
}

function incrementTempo() {
  tempo.value = Math.round((tempo.value + 0.01) * 100) / 100
}

function decrementTempo() {
  tempo.value = Math.round((tempo.value - 0.01) * 100) / 100
}

function setTempoRange(range: 8 | 16 | 50) {
  tempoRange.value = range
  const { min, max } = getTempoRangeMinMax(bpm, range)
  tempo.value = clamp(tempo.value, min, max)
}

function onTempoChange(event: Event) {
  const target = event.target as HTMLInputElement
  tempo.value = parseFloat(target.value)
}

const keyLock = shallowRef<boolean>(false)

function toggleKeyLock() {
  keyLock.value = !keyLock.value
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex">
      <button
        @click="toggleKeyLock"
        :class="{ 'bg-muted': keyLock }"
        class="border px-3 py-2  leading-none text-sm">
        Key Lock
      </button>
    </div>
    <div class="flex">
      <button
        @click="setTempoRange(8)"
        :class="{ 'bg-muted': tempoRange === 8 }"
        class="border px-3 py-2 tabular-nums leading-none text-sm">
        8
      </button>
      <button
        @click="setTempoRange(16)"
        :class="{ 'bg-muted': tempoRange === 16 }"
        class="border px-3 py-2 tabular-nums leading-none text-sm">
        16
      </button>
      <button
        @click="setTempoRange(50)"
        :class="{ 'bg-muted': tempoRange === 50 }"
        class="border px-3 py-2 tabular-nums leading-none text-sm">
        50
      </button>
    </div>
    <div class="grid grid-cols-3">
      <button
        @click="decrementTempo"
        class="grid aspect-square h-full place-items-center tabular-nums leading-none">
        <IconMinus class="size-4 " />
      </button>
      <div class="flex flex-col items-center justify-center text-center">
        <span class=" text-center tabular-nums text-sm">{{ tempoPercentage }}</span>
        <span class=" text-center text-[0.6235rem] font-bold leading-tight">
          BPM
        </span>
      </div>
      <button
        @click="incrementTempo"
        class="grid aspect-square h-full place-items-center tabular-nums leading-none">
        <IconPlus class="size-4" />
      </button>
    </div>
    <div>
      <input
        :value="tempoPercentage"
        @input="onTempoChange"
        aria-orientation="vertical"
        v-bind="getTempoRangeMinMax(bpm, tempoRange)"
        step="0.01"
        type="range" />
    </div>
  </div>
</template>
