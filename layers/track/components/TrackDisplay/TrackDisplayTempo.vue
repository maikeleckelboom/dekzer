<script lang="ts" setup>
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext
</script>

<template>
  <span
    v-if="track?.common.bpm"
    class="text-foreground w-full text-end text-xl tabular-nums">
    {{ track.common.bpm }}
  </span>
</template>

<style scoped></style>
