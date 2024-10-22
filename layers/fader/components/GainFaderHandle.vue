<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'

const {
  dBMin = -12,
  dBMax = 12,
  min = 0,
  max = 1,
  orientation = 'vertical'
} = defineProps<{
  dBMin: number
  dBMax: number
  min?: number
  max?: number
  orientation?: 'horizontal' | 'vertical'
}>()

const modelValue = defineModel<number>('modelValue', {
  type: Number,
  required: true
})

const isHorizontal = computed(() => orientation === 'horizontal')
const orientationMultiplier = computedEager(() => (isHorizontal.value ? 1 : -1))

const INITIAL_CONTAINER_SIZE = 214 as const
const HANDLE_SIZE = 14 as const

function getInitialOffset(value: number, min: number, max: number) {
  return unref(isHorizontal)
    ? ((value - min) / (max - min)) * 100
    : ((dBMax - value) / (max - min)) * 100 - (HANDLE_SIZE / INITIAL_CONTAINER_SIZE) * 100
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
    const multiplier = direction === 'up' || direction === 'left' ? 1 : -1
    const sideValue = unref(isHorizontal) ? distanceX.value : distanceY.value
    const progress = offsetStart.value + ((multiplier * sideValue) / INITIAL_CONTAINER_SIZE) * 100
    const delta = (HANDLE_SIZE / INITIAL_CONTAINER_SIZE) * 100
    const converted = convertRange(0, 100 - HANDLE_SIZE, dBMin, dBMax, offset.value)
    offset.value = clamp(progress, 0, 100 - delta)
    modelValue.value = clamp(converted * unref(orientationMultiplier), dBMin, dBMax)
  }
})
</script>

<template>
  <div
    ref="handle"
    :class="
      cn(
        isHorizontal
          ? `w-[${HANDLE_SIZE}px] top-0 flex h-full flex-row`
          : `h-[${HANDLE_SIZE}px] left-0 flex w-full flex-col`
      )
    "
    :style="{
      [isHorizontal ? 'left' : 'top']: `${offset}%`
    }"
    class="absolute flex cursor-grab touch-none select-none active:cursor-grabbing">
    <div
      :class="
        cn('bg-background', isHorizontal ? 'h-full w-[6px]' : 'h-[6px] w-full')
      " />
    <div
      :class="
        cn('bg-foreground', isHorizontal ? 'h-full w-[2px]' : 'h-[2px] w-full')
      " />
    <div
      :class="
        cn('bg-background', isHorizontal ? 'h-full w-[6px]' : 'h-[6px] w-full')
      " />
  </div>
</template>
