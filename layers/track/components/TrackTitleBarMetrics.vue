<script lang="ts" setup>
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBarRoot.vue'
import { MusicalKeysMap } from '~~/layers/deck/utils/constants'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext

const colorClass = computedEager(() => {
  if (!track.value?.common?.key) return
  return MusicalKeysMap.get(track.value.common.key)?.class
})
</script>

<template>
  <div class="col-start-3 row-span-full ml-auto flex flex-col mr-2">
    <div
      v-if="track?.common"
      class="flex flex-row items-center gap-x-2">
      <span
        class="font-bold mix-blend-lighten"
        :class="colorClass"
      >
        {{ track.common.key }}
      </span>
      <span class="text-foreground w-full text-end text-xl tabular-nums">
        {{ track.common.bpm }}
      </span>
    </div>
    <span
      v-if="track?.format"
      class="text-foreground text-end text-sm tabular-nums leading-none md:text-base">
      {{ formatSeconds(track?.format.duration) }}
    </span>
  </div>
</template>

<style scoped></style>
