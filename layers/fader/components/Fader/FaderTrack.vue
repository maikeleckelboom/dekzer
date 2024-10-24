<script lang="ts" setup>
import { injectFaderRootContext } from '~~/layers/fader/components/Fader/FaderRoot.vue'

const { disabled, orientation } = injectFaderRootContext({
  min: shallowRef(0),
  max: shallowRef(1),
  step: shallowRef(0.01),
  modelValue: shallowRef(0),
  offset: shallowRef(0),
  disabled: shallowRef(false),
  orientation: shallowRef('horizontal'),
  width: shallowRef(0),
  height: shallowRef(0)
})
</script>

<template>
  <div
    :class="
      cn(
        'flex',
        orientation === 'horizontal'
          ? 'h-10 w-full min-w-44 flex-col'
          : 'h-full min-h-44 w-10 flex-row'
      )
    ">
    <slot />
  </div>
</template>
