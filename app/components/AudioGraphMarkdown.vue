<script lang="ts" setup>
const text = `[Deck 1 Source]
      → [Deck 1 Gain (-12dB to +12dB)]
      → [Deck 1 Gain (0-1)]
      → [Deck 1 EQ Hi]
      → [Deck 1 EQ Mid]
      → [Deck 1 EQ Lo]
      → [Deck 1 Panner]
      → [Master Gain]
      → [AudioContext.destination]
                 |
                 |→ [Deck 1 Analyser L]
                 |
                 |→ [Deck 1 Analyser R]

[Deck 2 Source]
      → [Deck 2 Gain (-12dB to +12dB)]
      → [Deck 2 Gain (0-1)]
      → [Deck 2 EQ Hi]
      → [Deck 2 EQ Mid]
      → [Deck 2 EQ Lo]
      → [Deck 2 Panner]
      → [Master Gain]
      → [AudioContext.destination]
                 |
                 |→ [Deck 2 Analyser L]
                 |
                 |→ [Deck 2 Analyser R]
`
</script>

<template>
  <pre>{{ text }}</pre>
</template>

<style scoped></style>
