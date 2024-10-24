<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

const { disabled, orientation } = injectFaderRootContext({
  disabled: false,
  orientation: 'horizontal'
}) as FaderContext
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
