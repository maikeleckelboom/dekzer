<script lang="ts" setup>
const bpm = defineModel<number>('bpm', {
  type: Number,
  default: 100
})

const tempoDiff = defineModel<number>('tempoDiff', {
  type: Number,
  default: 0
})

const bpmRange = defineModel<8 | 16 | 50>('bpmRange', {
  type: Number,
  default: 8
})

function getTempoRange(originalBpm: number, bpmRange = 8) {
  const min = originalBpm - originalBpm * (bpmRange / 100)
  const max = originalBpm + originalBpm * (bpmRange / 100)
  return [min, max]
}

const range = shallowRef(getTempoRange(bpm.value, bpmRange.value))

watch(bpm, (tempo) => {
  console.log('bpm', tempo)
})

watch(tempoDiff, (diff) => {
  console.log('diff', diff)
})
</script>

<template>
  <Fader
    v-model="bpm"
    :max="range[1]"
    :min="range[0]"
    :step="0.01"
    class="h-full"
    orientation="vertical">
    <div class="h-full w-1/2"></div>
    <div class="h-full w-1/2"></div>
  </Fader>
</template>

<style scoped></style>
