<script lang="ts">
import type { Track } from '~~/layers/track/types'

export interface TrackTitleBarRootProps {
  track: Track | undefined
}

export interface TrackTitleBarContext {
  track: Ref<Track | undefined>
}

const providerComponentName = 'TrackTitleBarRoot'
const contextName = 'TrackTitleBarContext'
export const [injectTrackTitleBarContext, provideTrackTitleBarContext] =
  createContext<TrackTitleBarContext>([providerComponentName], contextName)
</script>

<script lang="ts" setup>
import type { Track } from '~~/layers/track/types'

const props = defineProps<TrackTitleBarRootProps>()

provideTrackTitleBarContext({
  track: toRef(props, 'track')
})
</script>

<template>
  <div class="grid grid-cols-[auto,auto,1fr] grid-rows-2 gap-x-2 py-2">
    <slot />
  </div>
</template>
