<script setup lang="ts">
import { type FaderRootContext, injectFaderRootContext } from '~~/layers/fader/components/Fader/FaderRoot.vue'

const { modelValue } = injectFaderRootContext() as FaderRootContext
</script>

<template>
  <div>
    {{modelValue}}
    <slot/>
  </div>
</template>