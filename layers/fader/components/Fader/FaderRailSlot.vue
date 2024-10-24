<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

// Draw a fill from the start of the slider to the handle
const { offset, width, height, orientation, min, max, defaultValue, modelValue } =
  injectFaderRootContext({
    orientation: shallowRef('horizontal'),
    defaultValue: shallowRef(0),
    modelValue: shallowRef(0),
    offset: shallowRef(0),
    width: shallowRef(0),
    height: shallowRef(0),
    min: shallowRef(0),
    max: shallowRef(1)
  } as FaderContext)

const mounted = useMounted()

const isHorizontal = computed(() => orientation.value === 'horizontal')

const containerSize = computed(() => (unref(isHorizontal) ? width.value : height.value))

const fillStyle = computed(() => {
  const distanceCenter = min.value + (max.value - min.value) / 2 - modelValue.value
  const absDistanceCenter = Math.abs(distanceCenter)

  // Calculate the fill size based on the distance from the center
  const fillSize = (absDistanceCenter / (max.value - min.value)) * containerSize.value
const handleHalf = 8

  // For horizontal, reverse the direction of fillOffset
  const fillOffset = unref(isHorizontal)
    ? distanceCenter > 0
      ? containerSize.value / 2 - fillSize
      : containerSize.value / 2
    : distanceCenter > 0
      ? containerSize.value / 2
      : containerSize.value / 2 - fillSize

  // Return the appropriate styles for horizontal and vertical sliders
  return {
    [unref(isHorizontal) ? 'width' : 'height']: `${fillSize - 2}px`,
    [unref(isHorizontal) ? 'left' : 'top']: `${fillOffset}px`,
    [unref(isHorizontal) ? 'top' : 'left']: '0%',
    [unref(isHorizontal) ? 'height' : 'width']: '100%'
  }
})
</script>

<template>
  <div
    :class="
      cn(
        'relative m-auto overflow-clip p-px rounded-[1px] bg-black',
        orientation === 'horizontal' ? 'h-1 w-full' : 'h-full w-1'
      )
    ">
    <div
      :class="cn('relative bg-blue-500')"
      :style="fillStyle" />
  </div>
</template>

<style scoped></style>
