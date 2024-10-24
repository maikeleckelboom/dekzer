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
          : 'h-full min-h-44 w-10 flex-row',
        'after:absolute after:top-1/2 after:h-2 after:w-full',
        'after:bg-muted rounded after:-translate-y-1/2 after:rounded-[1px]'
      )
    ">
    <slot />
  </div>
</template>
