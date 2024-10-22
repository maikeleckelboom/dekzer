<script lang="ts" setup>
interface FaderProps {
  orientation?: 'horizontal' | 'vertical'
  modelValue: number
}

const { orientation = 'vertical' } = defineProps<FaderProps>()

const modelValue = defineModel<FaderProps, 'modelValue'>({ type: Number })
</script>

<template>
  <div
    :class="cn(orientation === 'horizontal' ? 'flex-col' : 'flex-row')"
    class="relative flex size-fit select-none gap-0.5 touch-none">
    <slot />
  </div>
</template>
