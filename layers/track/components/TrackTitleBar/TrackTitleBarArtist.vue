<script setup lang="ts">
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext
</script>

<template>
  <div class="row-start-2 flex items-start">
    <p class="leading-normal text-sm">
      {{track?.common.artist}}
    </p>
  </div>
</template>