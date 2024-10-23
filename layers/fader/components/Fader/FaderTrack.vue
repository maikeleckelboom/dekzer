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
    :class="cn(
      'bg-muted',
      orientation === 'horizontal' ? 'h-10 w-full min-w-44' : 'w-10 h-full min-h-44',
    )">
    <slot />
  </div>
</template>