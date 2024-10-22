<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'
import {
  FADER_CONTAINER_SIZE,
  FADER_HANDLE_SIZE
} from '~~/layers/fader/components/utils/constants'
import { clamp, type UseSwipeDirection } from '@vueuse/core'

const { offset, disabled, orientation, min, max, modelValue, width, height } =
  injectFaderRootContext({
    min: 0,
    max: 1,
    modelValue: 0,
    offset: 0,
    disabled: false,
    orientation: 'horizontal',
    width: FADER_CONTAINER_SIZE,
    height: FADER_CONTAINER_SIZE
  }) as FaderContext

const isHorizontal = computed(() => orientation.value === 'horizontal')
const containerSize = computed(() => (unref(isHorizontal) ? width.value : height.value))

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
    const sideValue = unref(isHorizontal) ? unref(distanceX) : unref(distanceY)
    const progress = unref(offsetStart) + ((multiplier * sideValue) / unref(containerSize)) * 100
    const delta = (FADER_HANDLE_SIZE / unref(containerSize)) * 100
    offset.value = clamp(progress, 0, 100 - delta)

    const invert = unref(isHorizontal)
    const baseValue = invert ? unref(offset) / (100 - delta) : 1 - unref(offset) / (100 - delta)
    modelValue.value = clamp(
      baseValue * (unref(max) - unref(min)) + unref(min),
      unref(min.value),
      unref(max.value)
    )
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
    <div :class="cn('bg-background', isHorizontal ? 'h-full w-[6px]' : 'h-[6px] w-full')" />
    <div :class="cn('bg-foreground', isHorizontal ? 'h-full w-[2px]' : 'h-[2px] w-full')" />
    <div :class="cn('bg-background', isHorizontal ? 'h-full w-[6px]' : 'h-[6px] w-full')" />
  </div>
</template>
