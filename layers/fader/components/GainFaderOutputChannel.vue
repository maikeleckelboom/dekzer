<script lang="ts" setup>
import { clamp } from '@vueuse/core'

interface SegmentMeterProps {
  dBMin?: number
  dBMax?: number
  orient?: 'horizontal' | 'vertical'
  segments?: number
}

const {
  dBMin = -48,
  dBMax = 0,
  segments = 40,
  orient = 'vertical'
} = defineProps<SegmentMeterProps>()

const modelValue = defineModel<number>('modelValue', {
  type: Number,
  required: true
})

const bars = computed(() => {
  const range = dBMax - dBMin
  const step = range / segments
  const value = modelValue.value
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
  [-10, { start: '#02af02', end: '#a9f314' }]
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

  const normalized = normalize(value)

  if (color && color.start && color.end) {
    return interpolateColor(color.start, color.end, normalized)
  }

  return ''
}

function segmentStyle(segment: number): Record<string, string> {
  return modelValue.value >= segment ? { backgroundColor: getClosestColor(segment) } : {}
}
</script>

<template>
  <div class="flex size-fit flex-col">
    <div
      v-for="segment in bars"
      :key="segment"
      :style="segmentStyle(segment)"
      class="bg-muted/75 mb-[2px] h-[3px] w-[14px] last:mb-0" />
  </div>
</template>
