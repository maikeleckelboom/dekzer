<script lang="ts" setup>
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext

const keyClass = computedEager<string>(() => {
  if (!track.value?.common?.key) return
  const { key } = track.value.common
  if (!MusicalKeysMap.has(key)) return
  const { color } = MusicalKeysMap.get(key)
  return color
})
</script>

<template>
  <span
    v-if="track?.common"
    :class="keyClass"
    class="font-bold">
    {{ track.common.key }}
  </span>
</template>