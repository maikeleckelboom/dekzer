<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'
import TrackArtworkFallback from '~/components/TrackArtworkFallback.vue'

const { track, playing = false } = defineProps<{ track?: Track; playing?: boolean }>()
const currentTime = defineModel<number>('currentTime', { type: Number, default: 0 })

const trackTitle = computed(() => track?.common.title)
const trackArtist = computed(() => track?.common.artist)
const trackArtwork = computed(() => track?.pictureUrl)
const trackNativeBpm = computed(() => track?.common.bpm)
const trackNativeKey = computed(() => track?.common.key)
const trackDuration = computed(() => track?.format.duration)

const isReady = computed(() => isDefined(trackDuration))
</script>

<template>
  <div class="flex justify-between">
    <!-- TitleBar -->
    <div class="grid w-fit auto-cols-max grid-rows-2 gap-x-1 pr-4 md:gap-x-2">
      <div class="row-span-full flex items-center p-1">
        <!-- Artwork -->
        <div class="relative size-10 overflow-clip rounded md:size-12">
          <img
            v-if="trackArtwork"
            :src="trackArtwork"
            alt="Artwork"
            class="size-full object-cover" />
          <TrackArtworkFallback
            v-else
            class="size-full" />
        </div>
      </div>
      <div class="row-start-1 flex items-end">
        <!-- Title -->
        <span
          class="text-foreground truncate text-start text-base font-semibold leading-tight md:text-xl md:leading-tight">
          {{ trackTitle }}
        </span>
      </div>
      <div class="row-start-2 flex items-start">
        <!-- Artist -->
        <span class="text-foreground truncate text-sm md:text-lg md:leading-tight">
          {{ trackArtist }}
        </span>
      </div>
    </div>
    <!-- End TitleBar -->
    <!-- TrackInfo -->
    <div
      v-if="isReady"
      class="flex w-fit flex-col px-2 py-1">
      <div class="flex flex-row items-center gap-x-2">
        <span class="text-foreground font-bold text-yellow-300">
          {{ trackNativeKey ?? '4A' }}
        </span>
        <span class="text-foreground w-full text-end text-xl tabular-nums">
          {{ trackNativeBpm }}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-foreground text-sm tabular-nums md:text-base text-end">
          {{ formatSeconds(currentTime - trackDuration) }}
        </span>
      </div>
    </div>
    <!-- End TrackInfo -->
  </div>
</template>
