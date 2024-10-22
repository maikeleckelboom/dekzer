<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'

const {
  dBMin = -12,
  dBMax = 12,
  orientation = 'vertical'
} = defineProps<{
  dBMin: number
  dBMax: number
  orientation?: 'horizontal' | 'vertical'
}>()

const modelValue = defineModel<number>('modelValue', {
  type: Number,
  required: true
})

const CONTAINER_SIZE = 214 as const
const HANDLE_SIZE = 14 as const

function getInitialOffset(value: number, min: number, max: number) {
  return ((dBMax - value) / (max - min)) * 100 - (HANDLE_SIZE / CONTAINER_SIZE) * 100
}

const offset = ref<number>(getInitialOffset(modelValue.value, dBMin, dBMax))

const offsetStart = ref<number>(0)
const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceY, isSwiping } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: 0,
  onSwipeStart(event: PointerEvent) {
    event.preventDefault()
    offsetStart.value = offset.value
  },
  onSwipe(_: PointerEvent, direction: UseSwipeDirection) {
    const multiplier = direction === 'down' ? 1 : -1
    const progress = offsetStart.value + ((multiplier * distanceY.value) / CONTAINER_SIZE) * 100
    const delta = (HANDLE_SIZE / CONTAINER_SIZE) * 100
    const converted = convertRange(0, 100 - HANDLE_SIZE, dBMin, dBMax, offset.value)
    offset.value = clamp(progress, 0, 100 - delta)
    modelValue.value = clamp(converted * -1, dBMin, dBMax)
  }
})
</script>

<template>
  <div
    ref="handle"
    :style="{
      [orientation === 'horizontal' ? 'left' : 'top']: `${clamp(offset, 0, 100)}%`,
      [orientation === 'horizontal' ? 'top' : 'left']: '0',
      [orientation === 'horizontal' ? 'transform' : '']: `translate(-50%, -50%)`
    }"
    class="absolute left-0 top-0 w-full cursor-grab touch-none select-none active:cursor-grabbing">
    <div
      :class="
        cn(
          isSwiping ? 'bg-background/80' : 'bg-background/50',
          orientation === 'horizontal' ? 'w-[6px] h-full' : 'h-[6px] w-full'
        )
      " />
    <div
      :class="
        cn(
          orientation === 'horizontal' ? 'h-full w-[2px]' : 'h-[2px] w-full',
          isSwiping ? 'bg-foreground/80' : 'bg-foreground/50'
        )
      "
      class="bg-foreground" />
    <div
      :class="
        cn(
          isSwiping ? 'bg-background/80' : 'bg-background/50',
          orientation === 'horizontal' ? 'h-full w-[6px]' : 'h-[6px] w-full'
        )
      " />
  </div>
</template>
