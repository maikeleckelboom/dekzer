<script lang="ts" setup>
import { injectTrackOverviewContext } from '~~/layers/track/components/TrackOverview/TrackOverviewRoot'
import type { TrackOverviewContext } from '~~/layers/track/components/TrackOverview/TrackOverviewRoot.vue'

const { track, currentTime } = injectTrackOverviewContext() as TrackOverviewContext
</script>

<template>
  <div>
    <slot />
  </div>
</template>
