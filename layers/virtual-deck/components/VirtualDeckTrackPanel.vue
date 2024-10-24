<script lang="ts" setup>
import {
  injectVirtualDeckRootContext,
  type VirtualDeckRootContext
} from '~~/layers/virtual-deck/components/VirtualDeckRoot.vue'

const { currentTime, duration, pitchDelta, pitchRange, bpm } =
  injectVirtualDeckRootContext() as VirtualDeckRootContext

const currentTimeDisplay = computed(() => {
  if (typeof currentTime.value === 'undefined') return ''
  return formatSeconds(currentTime.value)
})

const remainingTimeDisplay = computed(() =>
  duration.value ? formatSeconds(duration.value - currentTime.value) : ''
)

const bpmDisplay = computed(() => {
  const tempo = unref(bpm)
  if (typeof tempo === 'undefined') return ''
  const isRound = tempo % 1 === 0
  return isRound ? tempo.toString() : tempo.toFixed(2)
})

const getSign = (value: number): string => (value >= 0 ? '+' : '')
const pitchDisplay = computed(() => {
  if (typeof pitchDelta.value === 'undefined') return ''
  return `${getSign(pitchDelta.value)}${pitchDelta.value}%`
})

const pitchRangeDisplay = computed(() => {
  if (typeof pitchRange.value === 'undefined') return ''
  return `±${pitchRange.value}`
})

const isReady = computed(() => duration.value > 0 && typeof currentTime.value !== 'undefined')
</script>

<template>
  <div
    :class="isReady ? 'opacity-100' : 'opacity-0'"
    class="absolute inset-0 mb-5 mt-2 grid grid-cols-2 grid-rows-[1fr,auto,1fr] items-center md:mt-4">
    <div class="col-span-2 flex flex-col items-center">
      <template v-if="bpmDisplay">
        <strong
          class="text-background select-none whitespace-pre-wrap text-center text-xl font-black capitalize md:text-3xl">
          {{ bpmDisplay }}
        </strong>
        <p class="text-background text-center text-xs leading-none">BPM</p>
      </template>
    </div>
    <div class="mb-6">
      <template v-if="pitchDisplay">
        <p
          :class="
            cn(
              'text-background select-none text-center text-xs font-semibold capitalize tabular-nums leading-none tracking-wider md:text-sm md:tracking-widest'
            )
          ">
          {{ pitchDisplay }}
        </p>
      </template>
    </div>
    <div class="mb-6">
      <template v-if="pitchRange">
        <p
          :class="
            cn(
              'text-background select-none text-center text-xs font-semibold capitalize tabular-nums leading-none tracking-wider md:text-sm md:tracking-widest'
            )
          ">
          {{ pitchRangeDisplay }}
        </p>
      </template>
    </div>
    <template v-if="typeof currentTime !== 'undefined' && typeof duration !== 'undefined'">
      <div class="col-span-2 mb-1 flex flex-col items-center">
        <strong
          :class="
            cn(
              'text-background select-none text-center text-sm font-semibold capitalize tabular-nums leading-tight md:text-lg md:leading-none'
            )
          ">
          {{ currentTimeDisplay }}
        </strong>
        <strong
          :class="
            cn(
              'text-background select-none text-center text-sm font-semibold capitalize tabular-nums leading-none md:text-lg md:leading-tight'
            )
          ">
          <slot name="remainingTime">
            {{ remainingTimeDisplay }}
          </slot>
        </strong>
      </div>
    </template>
  </div>
</template>
