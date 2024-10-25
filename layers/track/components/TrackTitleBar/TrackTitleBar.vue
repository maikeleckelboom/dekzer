<script lang="ts" setup>
import { useForwardPropsEmits } from 'radix-vue'
import type { TrackTitleBarRootProps } from '~~/layers/track/components/TrackTitleBar/TrackTitleBarRoot.vue'

interface TrackTitleBarProps extends TrackTitleBarRootProps {}

const props = defineProps<TrackTitleBarProps>()

const forward = useForwardPropsEmits(props)
</script>

<template>
  <TrackTitleBarRoot v-bind="forward">
    <TrackTitleBarTitle />
    <TrackTitleBarArtist />
    <TrackTitleBarPicture>
      <TrackTitleBarPictureFallback />
    </TrackTitleBarPicture>
  </TrackTitleBarRoot>
</template>
