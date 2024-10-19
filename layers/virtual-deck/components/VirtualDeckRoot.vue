<script lang="ts">
import type { ComputedRef } from '@vue/reactivity'

export type VirtualDeckRootProps = Partial<{
  currentTime: number
  duration: number
  bpm: number
  pitchDelta: number
  pitchRange: 8 | 16 | 50
  disabled: boolean
}>

export interface VirtualDeckRootEmits {
  'update:currentTime': [payload: number]
  'update:progress': [payload: number]
  'update:interacting': [payload: boolean]
}

export interface VirtualDeckRootContext {
  currentTime: Ref<number>
  duration: Readonly<Ref<number>>
  pitchDelta: ComputedRef<number>
  pitchRange: ComputedRef<8 | 16 | 50>
  interacting: ComputedRef<boolean>
  progress: ComputedRef<number>
  bpm: ComputedRef<number>
  angle: Ref<number>
}

export const [injectVirtualDeckRootContext, provideVirtualDeckRootContext] =
  createContext<VirtualDeckRootContext>('VirtualDeckRoot')
</script>

<script lang="ts" setup>
import { clamp } from '@vueuse/core'

const props = defineProps<VirtualDeckRootProps>()
const emits = defineEmits<VirtualDeckRootEmits>()

const currentTime = useVModel(props, 'currentTime', emits)

const pitchDelta = computedEager(() => props?.pitchDelta ?? 0)
const pitchRange = computedEager(() => props?.pitchRange)
const bpm = computedEager(() => props?.bpm)
const duration = computedEager(() => props?.duration)

const virtualDeck = useTemplateRef<HTMLElement>('virtualDeck')

const playbackRate = computed(() => 1 + pitchDelta.value)

const { interacting, angle } = useVirtualDeck(
  virtualDeck,
  currentTime,
  playbackRate,
  () => props.disabled
)

watch(interacting, (value) => {
  emits('update:interacting', value)
})

const progress = computed(() => {
  const currTime = toValue(currentTime) ?? 0
  const totalTime = toValue(duration) ?? 1
  return clamp(currTime / totalTime, 0, 1)
})

watch(progress, (value) => {
  emits('update:progress', value)
})

provideVirtualDeckRootContext({
  currentTime,
  duration,
  bpm,
  pitchDelta,
  pitchRange,
  progress,
  interacting,
  angle
})

defineSlots<{ default: void }>()
</script>

<template>
  <div
    ref="virtualDeck"
    :aria-disabled="!duration"
    :class="
      cn(
        'relative m-auto grid place-items-center overflow-clip',
        'bg-muted border-background/80 rounded-full border',
        'aspect-square size-40 touch-none select-none md:size-48',
        'aria-disabled:opacity-50 aria-disabled:grayscale',
        'disabled:opacity-50 disabled:grayscale',
        $attrs.class ?? ''
      )
    ">
    <slot />
  </div>
</template>
