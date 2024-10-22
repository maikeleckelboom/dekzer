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
const { distanceX, distanceY, isSwiping } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: 0,
  onSwipeStart(event: PointerEvent) {
    event.preventDefault()
    offsetStart.value = offset.value
  },
  onSwipe(_: PointerEvent, direction: UseSwipeDirection) {
    const side = orientation === 'horizontal' ? 'x' : 'y'
    const multiplier = direction === 'up' || direction === 'left' ? 1 : -1
    const sideValue = side === 'x' ? distanceX.value : distanceY.value
    const progress = offsetStart.value + ((multiplier * sideValue) / CONTAINER_SIZE) * 100
    const delta = (HANDLE_SIZE / CONTAINER_SIZE) * 100
    const converted = convertRange(0, 100 - HANDLE_SIZE, dBMin, dBMax, offset.value)
    offset.value = clamp(progress, 0, 100 - delta)
    const modelValueMultiplier = orientation === 'vertical' ? -1 : 1
    modelValue.value = clamp(converted * modelValueMultiplier, dBMin, dBMax)
  }
})
</script>

<template>
  <div
    ref="handle"
    :class="
      cn(
        orientation === 'horizontal'
          ? `w-[${HANDLE_SIZE}px] top-0 flex h-full flex-row`
          : `h-[${HANDLE_SIZE}px] left-0 flex w-full flex-col`
      )
    "
    :style="{
      [orientation === 'horizontal' ? 'left' : 'top']: `${offset}%`
    }"
    class="absolute flex cursor-grab touch-none select-none active:cursor-grabbing">
    <div
      :class="
        cn(
          isSwiping ? 'bg-background/80' : 'bg-background/60',
          orientation === 'horizontal' ? 'h-full w-[6px]' : 'h-[6px] w-full'
        )
      " />
    <div
      :class="
        cn(
          orientation === 'horizontal' ? 'h-full w-[2px]' : 'h-[2px] w-full',
          isSwiping ? 'bg-foreground/80' : 'bg-foreground/60'
        )
      " />
    <div
      :class="
        cn(
          isSwiping ? 'bg-background/80' : 'bg-background/60',
          orientation === 'horizontal' ? 'h-full w-[6px]' : 'h-[6px] w-full'
        )
      " />
  </div>
</template>
