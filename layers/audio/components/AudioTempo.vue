<script lang="ts" setup>
import { AudioTrack } from '#components'

const {  trackInstance } = defineProps<{
  trackInstance: InstanceType<typeof AudioTrack>
}>()

const tempo = defineModel<number>('tempo', {
  type: Number,
  default: 0
})

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
  const { min, max } = getTempoRangeMinMax(tempo.value, range)
  tempo.value = clamp(tempo.value, min, max)
}

function onTempoChange(event: Event) {
  const target = event.target as HTMLInputElement
  tempo.value = parseFloat(target.value)
}

const keyLocked = ref<boolean>(true)
const toggle = () => {
  keyLocked.value = !keyLocked.value
}

watch(keyLocked, (locked: boolean) => {
  if (!trackInstance) return
  trackInstance.setPreservesPitch(locked)
})

watch(tempo, (bpm) => {
  if (!trackInstance || !bpm) return
  trackInstance.setPlaybackRate(bpm / 100)
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="grid grid-cols-3">
      <div class="flex flex-col items-center justify-center text-center">
        <span class="text-center text-sm tabular-nums">{{ tempoPercentage }}</span>
        <span class="text-center text-[0.6235rem] font-bold leading-tight"> BPM </span>
      </div>
      <div class="flex gap-1">
        <button
          class="grid aspect-square h-full place-items-center tabular-nums leading-none"
          @click="incrementTempo">
          <IconPlus class="size-4" />
        </button>
        <button
          class="grid aspect-square h-full place-items-center tabular-nums leading-none"
          @click="decrementTempo">
          <IconMinus class="size-4" />
        </button>
      </div>
    </div>
    <div>
      <input
        :value="tempoPercentage"
        aria-orientation="vertical"
        step="0.01"
        type="range"
        class="rotate-180"
        v-bind="getTempoRangeMinMax(tempo, tempoRange)"
        @input="onTempoChange" />
    </div>
    <div class="flex">
      <button
        :class="{ 'bg-muted': keyLocked }"
        class="border px-3 py-2 text-sm leading-none"
        @click="toggle">
        Key Lock
      </button>
    </div>
    <div class="flex">
      <button
        :class="{ 'bg-muted': tempoRange === 8 }"
        class="border px-3 py-2 text-sm tabular-nums leading-none"
        @click="setTempoRange(8)">
        8
      </button>
      <button
        :class="{ 'bg-muted': tempoRange === 16 }"
        class="border px-3 py-2 text-sm tabular-nums leading-none"
        @click="setTempoRange(16)">
        16
      </button>
      <button
        :class="{ 'bg-muted': tempoRange === 50 }"
        class="border px-3 py-2 text-sm tabular-nums leading-none"
        @click="setTempoRange(50)">
        50
      </button>
    </div>
  </div>
</template>
