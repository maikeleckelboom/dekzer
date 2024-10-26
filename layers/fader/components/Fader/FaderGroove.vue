<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

const { width, height, orientation, min, max, modelValue } =
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

const isHorizontal = computed(() => orientation.value === 'horizontal')

const containerSize = computed(() => (isHorizontal.value ? width.value : height.value))

const fillStyle = computed(() => {
  const distanceCenter = min.value + (max.value - min.value) / 2 - modelValue.value
  const absDistanceCenter = Math.abs(distanceCenter)

  // Calculate the fill size based on the distance from the center
  const fillSize = (absDistanceCenter / (max.value - min.value)) * containerSize.value

  // For horizontal, reverse the direction of fillOffset
  const fillOffset = isHorizontal.value
    ? distanceCenter > 0
      ? containerSize.value / 2 - fillSize
      : containerSize.value / 2
    : distanceCenter > 0
      ? containerSize.value / 2
      : containerSize.value / 2 - fillSize

  // Return the appropriate styles for horizontal and vertical sliders
  return {
    [isHorizontal.value ? 'width' : 'height']: `${fillSize}px`,
    [isHorizontal.value ? 'left' : 'top']: `${fillOffset}px`,
    [isHorizontal.value ? 'top' : 'left']: '0%',
    [isHorizontal.value ? 'height' : 'width']: '100%'
  }
})
</script>

<template>
  <div
    :class="
      cn(
        'relative m-auto overflow-clip rounded-[1px] bg-black p-px',
       isHorizontal ? 'h-1 w-full' : 'h-full w-1'
      )
    ">
    <div
      :class="cn('relative bg-blue-500')"
      :style="fillStyle" />
  </div>
</template>
