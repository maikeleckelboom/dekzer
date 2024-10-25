<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

const { width, height, orientation, min, max, modelValue } = injectFaderRootContext({
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

const containerSize = computed(() => (unref(isHorizontal) ? unref(width) : unref(height)))

function getFillOffset(distanceCenter: number, fillSize: number) {
  if (unref(isHorizontal)) {
    return distanceCenter > 0 ? containerSize.value / 2 - fillSize : containerSize.value / 2
  } else {
    return distanceCenter > 0 ? containerSize.value / 2 : containerSize.value / 2 - fillSize
  }
}

function getFillDimensions(
  min: number,
  max: number,
  value: number,
  totalSize: number
): {
  distance: number
  size: number
} {
  const distance = Math.abs(min + (max - min) / 2 - value)
  const size = (distance / (max - min)) * totalSize
  return { distance, size }
}

const fillStyle = computed(() => {
  const { distance, size } = getFillDimensions(
    unref(min),
    unref(max),
    unref(modelValue),
    unref(containerSize)
  )
  const fillOffset = getFillOffset(distance, size)
  return {
    [unref(isHorizontal) ? 'width' : 'height']: `${size}px`,
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
        'relative m-auto overflow-clip rounded-[1px] bg-black p-px',
        orientation === 'horizontal' ? 'h-1 w-full' : 'h-full w-1'
      )
    ">
    <div
      :class="cn('relative bg-blue-500')"
      :style="fillStyle" />
  </div>
</template>
