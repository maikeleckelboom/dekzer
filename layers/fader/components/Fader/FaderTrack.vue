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
          : 'h-full min-h-44 w-10 flex-row',
        'after:absolute after:top-1/2 after:h-2 after:w-full',
        'after:bg-muted rounded after:-translate-y-1/2 after:rounded-[1px]'
      )
    ">
    <slot />
  </div>
</template>
