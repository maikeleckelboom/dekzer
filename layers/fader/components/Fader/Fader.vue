<script lang="ts" setup>
import { useForwardPropsEmits } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import type {
  FaderRootEmits,
  FaderRootProps
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

const props = defineProps<FaderRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<FaderRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <FaderRoot v-bind="forwarded">
    <FaderTrack>
      <FaderHandle />
    </FaderTrack>
  </FaderRoot>
</template>
