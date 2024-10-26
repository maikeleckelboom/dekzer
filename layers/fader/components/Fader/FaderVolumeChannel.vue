<script lang="ts" setup>
import { type FaderContext, injectFaderRootContext } from '~~/layers/fader/components/Fader/FaderRoot.vue'
import { clamp } from '~/utils/math'

const { disabled, orientation } = injectFaderRootContext({
  modelValue: shallowRef(0),
  orientation: shallowRef('horizontal'),
  min: shallowRef(0),
  max: shallowRef(1),
  step: shallowRef(0.01),
  disabled: shallowRef(false),
  offset: shallowRef(0),
  width: shallowRef(0),
  height: shallowRef(0),
  defaultValue: shallowRef(0.5)
}) as FaderContext

const isHorizontal = computed(() => orientation.value === 'horizontal')

const { value, segments = 30 } = defineProps<{ value: number; segments?: number }>()

const dBMin = -60
const dBMax = 0

const bars = computed(() => {
  const range = dBMax - dBMin
  const step = range / segments
  const value = -60 // dbValues.value[index]
  const result = []
  for (let i = segments; i >= 0; i--) {
    const segmentMin = dBMin + i * step
    const segmentMax = dBMin + (i + 1) * step - step
    const segmentValue = clamp(value, segmentMin, segmentMax)
    result.push(segmentValue)
  }
  return result
})

const colorMap: Map<number, string | { start: string; end: string }> = new Map([
  [0, { start: '#f44336', end: '#f44336' }],
  [-3, { start: '#ff9800', end: '#ff9800' }],
  [-10, { start: '#099a09', end: '#66ff00' }]
])

function interpolateColor(start: string, end: string, normalized: number): string {
  const interpolateChannel = (startHex: string, endHex: string): number =>
    parseInt(startHex, 16) +
    Math.round(normalized * (parseInt(endHex, 16) - parseInt(startHex, 16)))

  const r = interpolateChannel(start.slice(1, 3), end.slice(1, 3))
  const g = interpolateChannel(start.slice(3, 5), end.slice(3, 5))
  const b = interpolateChannel(start.slice(5, 7), end.slice(5, 7))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getClosestColorKey(value: number): number {
  return Array.from(colorMap.keys()).reduce((a, b) =>
    Math.abs(b - value) < Math.abs(a - value) ? b : a
  )
}

function normalize(value: number): number {
  return Math.abs((value - dBMin) / (dBMax - dBMin))
}

function getClosestColor(value: number): string {
  const closestKey = getClosestColorKey(value)
  const color = colorMap.get(closestKey)

  if(typeof color === 'undefined') {
    return ''
  }

  if (typeof color === 'string') {
    return color
  }

  if (color?.start && color?.end) {
    return interpolateColor(color.start, color.end, normalize(value))
  }

  return ''
}

function getBarStyle(bar: number): Record<string, string> {
  return value > bar ? { backgroundColor: getClosestColor(bar) } : {}
}

const id = useId()
</script>

<template>
  <div
    :id="id"
    :class="
      cn('flex size-fit', isHorizontal ? 'flex-row-reverse gap-x-[3px]' : 'flex-col gap-y-[3px]')
    ">
    <div
      v-for="bar in bars"
      :key="bar"
      :class="cn('bg-muted/80', isHorizontal ? 'h-[14px] w-[2px]' : 'h-[2px] w-[14px]')"
      :style="getBarStyle(bar)" />
  </div>
</template>
