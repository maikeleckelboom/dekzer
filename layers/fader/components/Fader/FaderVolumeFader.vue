<script lang="ts" setup>
import { useForwardPropsEmits } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import type {
  FaderRootEmits,
  FaderRootProps
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

const props = defineProps<
  FaderRootProps & {
    channels: number[]
    segments?: number
    class?: HTMLAttributes['class']
  }
>()

const emits = defineEmits<FaderRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <FaderRoot v-bind="forwarded">
    <FaderVolumeChannel
      :index="0"
      :segments="$props.segments"
      :value="$props.channels[0]!" />
    <FaderHandle />
    <FaderVolumeChannel
      :index="1"
      :segments="$props.segments"
      :value="$props.channels[1]!" />
  </FaderRoot>
</template>
