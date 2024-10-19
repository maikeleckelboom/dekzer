<script lang="ts" setup>
import {
  injectTrackTitleBarContext,
  type TrackTitleBarContext
} from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

const { track } = injectTrackTitleBarContext() as TrackTitleBarContext

defineSlots<{
  default: []
}>()
</script>

<template>
  <div class="col-start-1 row-span-full flex items-center px-2">
    <div class="relative size-10 overflow-clip">
      <img
        v-if="track?.pictureUrl"
        :src="track.pictureUrl"
        alt=""
        class="size-full object-cover" />
      <slot v-else />
    </div>
  </div>
</template>
