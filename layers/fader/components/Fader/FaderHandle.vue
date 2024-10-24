<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'
import { FADER_DEFAULT_HANDLE_SIZE } from '~~/layers/fader/utils/constants'
import type { UseSwipeDirection } from '@vueuse/core'

const { offset, disabled, orientation, min, max, step, modelValue, width, height } =
  injectFaderRootContext({
    min: shallowRef(0),
    max: shallowRef(1),
    step: shallowRef(0.01),
    modelValue: shallowRef(0),
    offset: shallowRef(0),
    disabled: shallowRef(false),
    orientation: shallowRef('horizontal'),
    width: shallowRef(0),
    height: shallowRef(0)
  }) as FaderContext

const isHorizontal = computed(() => orientation.value === 'horizontal')
const containerSize = computed(() => (unref(isHorizontal) ? width.value : height.value))

const offsetStart = ref<number>(0)

const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceX, distanceY, isSwiping, direction } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: 0,
  onSwipeStart(e: PointerEvent) {
    e.preventDefault()
    offsetStart.value = offset.value
  },
  // @ts-ignore
  onSwipe: (_e: PointerEvent, dir: UseSwipeDirection) => {
    const multiplier = ['up', 'left'].includes(dir) ? 1 : -1
    const sideValue = unref(isHorizontal) ? unref(distanceX) : unref(distanceY)
    const progress = unref(offsetStart) + ((multiplier * sideValue) / unref(containerSize)) * 100
    const delta = (FADER_DEFAULT_HANDLE_SIZE / unref(containerSize)) * 100
    offset.value = clamp(progress, 0, 100 - delta)

    const baseValue = unref(isHorizontal)
      ? unref(offset) / (100 - delta)
      : 1 - unref(offset) / (100 - delta)
    const rawValue = baseValue * (unref(max) - unref(min)) + unref(min)
    const stepValue = Math.round(rawValue / unref(step)) * unref(step)
    modelValue.value = clamp(stepValue, unref(min), unref(max))
  }
})
</script>

<template>
  <div
    ref="handle"
    :aria-disabled="disabled"
    :aria-orientation="orientation"
    :aria-valuemax="max"
    :aria-valuemin="min"
    :aria-valuenow="modelValue"
    :class="
      cn(
        'absolute flex cursor-grab touch-none select-none active:cursor-grabbing',
        'opacity-50 transition-opacity duration-75 ease-in-out hover:opacity-75 active:opacity-100',
        isHorizontal
          ? `w-[${FADER_DEFAULT_HANDLE_SIZE}px] top-0 flex h-full --x-1/2 flex-row`
          : `h-[${FADER_DEFAULT_HANDLE_SIZE}px] left-0 flex w-full --y-1/2 flex-col`
      )
    "
    :data-swiping="isSwiping"
    :style="{
      [isHorizontal ? 'left' : 'top']: `${offset}%`
    }"
    :tabindex="disabled ? -1 : 0"
    role="slider">
    <div :class="cn('bg-background', isHorizontal ? 'h-full w-[6px]' : 'h-[6px] w-full')" />
    <div :class="cn('bg-foreground', isHorizontal ? 'h-full w-[2px]' : 'h-[2px] w-full')" />
    <div :class="cn('bg-background', isHorizontal ? 'h-full w-[6px]' : 'h-[6px] w-full')" />
  </div>
</template>
