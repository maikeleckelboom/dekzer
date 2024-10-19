<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'

const { track } = defineProps<{ track?: Track }>()

watchEffect(() => {
  console.log('track', track)
})
</script>

<template>
  <TrackTitleBarRoot v-bind="{ track }">
    <TrackTitleBarTitle />
    <TrackTitleBarArtist />
    <TrackTitleBarPicture>
      <TrackTitleBarPictureFallback />
    </TrackTitleBarPicture>
    <TrackTitleBarMetrics />
  </TrackTitleBarRoot>
</template>
