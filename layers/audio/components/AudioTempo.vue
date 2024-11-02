<script setup lang="ts">
// The original BPM of the audio file
const { nativeBpm} = defineProps<{ nativeBpm: number }>()

// At 8% tempo range: BPM ±8%, e.g., 50 BPM → 46–54, 100 BPM → 92–108
const tempoRange = shallowRef<8 | 16 | 50>(8)

// The current tempo of the audio file
const tempo = shallowRef<number>(nativeBpm)

// The current tempo of the audio file in percentage
const tempoPercentage = computed({
  get: () => tempo.value,
  set: (value: number) => {
    tempo.value = value
  }
})


</script>

<template>
<div>

</div>
</template>