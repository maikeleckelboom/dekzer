<script lang="ts" setup>

const { bpm } = defineProps<{ bpm?: number }>()

const tempo = defineModel<number>(`tempo`, {
  type: Number,
  default: 0
})

function getTempoRange(bpm: number, bpmRange = 50) {
  /* When bpmRange = 8 it means +/- 8% of the current bpm */
  const min = bpm - (bpm * (bpmRange / 100))
  const max = bpm + (bpm * (bpmRange / 100))
  return [min, max]
}

const range = computed(() => getTempoRange(bpm))


</script>

<template>
  <div>
    {{ range }}
  </div>
</template>

<style scoped></style>
