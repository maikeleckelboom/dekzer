<script lang="ts" setup>
import { clamp, type UseSwipeDirection } from '@vueuse/core'
import { FADER_CONTAINER_SIZE, FADER_HANDLE_SIZE } from '~~/layers/fader/components/utils/constants'

const {
  dbMin = -12,
  dbMax = 12,
  min = 0,
  max = 1,
  orientation = 'vertical'
} = defineProps<{
  dbMin: number
  dbMax: number
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


function getInitialOffset(value: number, min: number, max: number) {
  return unref(isHorizontal)
    ? ((value - min) / (max - min)) * 100
    : ((dbMax - value) / (max - min)) * 100 - (FADER_HANDLE_SIZE / FADER_CONTAINER_SIZE) * 100
}

const offset = ref<number>(getInitialOffset(modelValue.value, dbMin, dbMax))

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
    //  Update ModelValue
    const multiplier = direction === 'up' || direction === 'left' ? 1 : -1
    const sideValue = unref(isHorizontal) ? distanceX.value : distanceY.value
    const progress = offsetStart.value + ((multiplier * sideValue) / FADER_CONTAINER_SIZE) * 100
    const delta = (FADER_HANDLE_SIZE / FADER_CONTAINER_SIZE) * 100
    const converted = convertRange(
      0,
      100 - FADER_HANDLE_SIZE,
      dbMin,
      dbMax,
      offset.value
    )
    offset.value = clamp(progress, 0, 100 - delta)
    modelValue.value = clamp(converted * unref(orientationMultiplier), dbMin, dbMax)
  }
})
</script>

<template>
  <div
    ref="handle"
    :class="
      cn(
        isHorizontal
          ? `w-[${FADER_HANDLE_SIZE}px] top-0 flex h-full flex-row`
          : `h-[${FADER_HANDLE_SIZE}px] left-0 flex w-full flex-col`
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
