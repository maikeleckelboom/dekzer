<script setup lang="ts">
// The original BPM of the audio file
const { bpm } = defineProps<{ bpm: number }>()

// At 8% tempo range: BPM ±8%, e.g., 50 BPM → 46–54, 100 BPM → 92–108
const tempoRange = shallowRef<8 | 16 | 50 | 100>(8)

// The current tempo of the audio file
const tempo = shallowRef<number>(bpm)

// The current tempo of the audio file in percentage
const tempoPercentage = computed({
  get: () => tempo.value,
  set: (value: number) => {
    tempo.value = value
  }
})

function getTempoRangeMinMax(originalBpm: number, bpmRange: 8 | 16 | 50 | 100) {
  const min = originalBpm - originalBpm * (bpmRange / 100)
  const max = originalBpm + originalBpm * (bpmRange / 100)
  return { min, max }
}

function incrementTempo() {
  tempoPercentage.value = Math.round((tempoPercentage.value + 0.1) * 10) / 10
}

function decrementTempo() {
  tempoPercentage.value = Math.round((tempoPercentage.value - 0.1) * 10) / 10
}

function setTempoRange(range: 8 | 16 | 50 | 100) {
  tempoRange.value = range
  // Update the tempo to reflect the new range, clamp to the new bounds
  const { min, max } = getTempoRangeMinMax(bpm, range)
  tempo.value = clamp(tempo.value, min, max)
}
</script>

<template>
  <div>
    <div class="flex gap-x-4">
      <button
        @click="decrementTempo"
        class="tabular-nums leading-none">
        -
      </button>
      <span>{{ tempoPercentage }} BPM</span>
      <button
        @click="incrementTempo"
        class="tabular-nums leading-none">
        +
      </button>
    </div>
    <div class="flex gap-x-4">
      <button
        @click="setTempoRange(8)"
        class="tabular-nums leading-none">
        8
      </button>
      <button
        @click="setTempoRange(16)"
        class="tabular-nums leading-none">
        16
      </button>
      <button
        @click="setTempoRange(50)"
        class="tabular-nums leading-none">
        50
      </button>
    </div>
    <div>
      <input
        v-model="tempo"
        aria-orientation="vertical"
        v-bind="getTempoRangeMinMax(bpm, tempoRange)"
        step="0.01"
        type="range" />
    </div>
  </div>
</template>
