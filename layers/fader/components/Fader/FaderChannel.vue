<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'
import { clamp } from '@vueuse/core'

const { disabled, orientation, dbValues } = injectFaderRootContext({
  disabled: false,
  orientation: 'horizontal',
  dbValues: [0, 0]
}) as FaderContext

const isHorizontal = computed(() => orientation.value === 'horizontal')

const {index} = defineProps<{index: number}>()

const dBMin = -48
const dBMax = 0
const segments = 40

const bars = computed(() => {
  const range = dBMax - dBMin
  const step = range / segments
  const value = dbValues.value.at(index)
  const result = []
  for (let i = segments; i >= 0; i--) {
    const segmentMin = dBMin + i * step
    const segmentMax = dBMin + (i + 1) * step - step
    const segmentValue = clamp(value, segmentMin, segmentMax)
    result.push(segmentValue)
  }
  return result
})

// 2 red, 4 orange, 34 green
const colorMap = new Map([
  [0, '#f44336'],
  [-3, '#ff9800'],
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

  if (typeof color === 'string') {
    return color
  }

  if (color && color.start && color.end) {
    return interpolateColor(color.start, color.end, normalize(value))
  }

  return ''
}


function segmentStyle(segment: number): Record<string, string> {
  const isOn = dbValues.value.at(index) >= segment
  return isOn ? { backgroundColor: getClosestColor(segment) } : {}
}

const id = useId()
</script>

<template>
  <div
    :id="id"
    :class="cn('flex size-fit', isHorizontal ? 'flex-row-reverse' : 'flex-col')"
    data-name="faderChannel">
    <div
      v-for="segment in bars"
      :key="segment"
      :class="
        cn(
          'bg-muted/80',
          isHorizontal
            ? 'mr-[3px] h-[14px] w-[2px] first:mr-0'
            : 'mb-[3px] h-[2px] w-[14px] last:mb-0'
        )
      "
      :style="segmentStyle(segment)" />
  </div>
</template>
