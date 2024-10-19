<script lang="ts" setup>
import {
  VirtualDeckPlatter,
  VirtualDeckProgress,
  VirtualDeckStylus,
  VirtualDeckTrackPanel
} from '#components'
import type {
  VirtualDeckRootEmits,
  VirtualDeckRootProps
} from '~~/layers/virtual-deck/components/VirtualDeckRoot.vue'
import { useForwardPropsEmits } from 'radix-vue'

interface VirtualDeckProps extends VirtualDeckRootProps {}

const props = defineProps<VirtualDeckProps>()

const emits = defineEmits<VirtualDeckRootEmits>()
const forward = useForwardPropsEmits(props, emits)
</script>

<template>
  <VirtualDeckRoot v-bind="forward">
    <VirtualDeckProgress />
    <VirtualDeckPlatter>
      <VirtualDeckStylus />
    </VirtualDeckPlatter>
    <VirtualDeckTrackPanel />
  </VirtualDeckRoot>
</template>
