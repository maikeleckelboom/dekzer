<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'

const { dBMin = -12, dBMax = 12 } = defineProps<{
  dBMin: number
  dBMax: number
}>()

const modelValue = defineModel<number>('modelValue', {
  type: Number,
  required: true
})

const CONTAINER_HEIGHT = 214 as const
const HANDLE_HEIGHT = 14 as const

function getInitialTop(value: number, min: number, max: number) {
  return ((dBMax - value) / (max - min)) * 100 - (HANDLE_HEIGHT / CONTAINER_HEIGHT) * 100
}

const offset = shallowRef<number>(getInitialTop(modelValue.value, dBMin, dBMax))

const offsetStart = shallowRef<number>(0)
const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceY, isSwiping } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: 0,
  onSwipeStart(event: PointerEvent) {
    event.preventDefault()
    offsetStart.value = top.value
  },
  onSwipe(_: PointerEvent, direction: UseSwipeDirection) {
    const multiplier = direction === 'down' ? 1 : -1
    const progress = offsetStart.value + ((multiplier * distanceY.value) / CONTAINER_HEIGHT) * 100
    const delta = (HANDLE_HEIGHT / CONTAINER_HEIGHT) * 100
    const converted = convertRange(0, 100 - HANDLE_HEIGHT, dBMin, dBMax, top.value)
    top.value = clamp(progress, 0, 100 - delta)
    modelValue.value = clamp(converted * -1, dBMin, dBMax)
  }
})
</script>

<template>
  <div
    ref="handle"
    :style="{
      top: `${clamp(top, 0, 100)}%`,
      zIndex: isSwiping ? 1 : 0,
    }"
    class="absolute left-0 top-0 w-full cursor-grab select-none active:cursor-grabbing touch-none">
    <div
      :class="isSwiping ? 'bg-background/80' : 'bg-background/50'"
      class="h-[6px] w-full" />
    <div class="bg-foreground h-[2px] w-full" />
    <div
      :class="isSwiping ? 'bg-background/80' : 'bg-background/50'"
      class="h-[6px] w-full" />
  </div>
</template>
