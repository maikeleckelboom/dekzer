<script lang="ts" setup>
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext

const keyClass = computedEager<string | undefined>(() => {
  if (!track.value?.common?.key) return
  const { key } = track.value.common
  const entry = MusicalKeysMap.get(key)
  if (!entry) return
  return entry.class
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
