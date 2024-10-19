<script lang="ts">
import type { Track } from '~~/layers/track/types'

export type TrackOverviewRootProps = Partial<{
  track: Track | null
  currentTime: number
}>

export interface TrackOverviewRootEmits {
  play: []
  pause: []
}

export interface TrackOverviewContext {
  track: Ref<Track | null>
  currentTime: ComputedRef<number>
}

export const [injectTrackOverviewContext, provideTrackOverviewContext] =
  createContext<TrackOverviewContext>(['TrackOverviewRoot'], 'TrackOverviewContext')
</script>

<script lang="ts" setup>
const props = withDefaults(defineProps<TrackOverviewRootProps>(), {
  track: null,
  currentTime: 0
})

const { track, currentTime } = toRefs(props)
const emits = defineEmits<TrackOverviewRootEmits>()



provideTrackOverviewContext({ track, currentTime })
</script>

<template>
  <div class="grid min-w-16 flex-grow border">
    <slot />
  </div>
</template>
