<script lang="ts" setup>
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext
</script>

<template>
  <span
    v-if="track?.format.duration"
    class="text-foreground text-end text-sm tabular-nums leading-none md:text-base">
    {{ formatSeconds(track?.format.duration) }}
  </span>
</template>
