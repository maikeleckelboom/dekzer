<script lang="ts">
import type { ComputedRef } from '@vue/reactivity'
import type { ShallowRef } from 'vue'

export type VirtualDeckRootProps = Partial<{
  currentTime: number
  duration: number
  bpm: number
  pitchDelta: number
  pitchRange: 8 | 16 | 50
  disabled: boolean
}>

export interface VirtualDeckRootEmits {
  (event: 'update:interacting', value: boolean): void
  (event: 'update:progress', value: number): void
  (event: 'update:currentTime', value: number): void
}

export interface VirtualDeckRootContext {
  currentTime: Ref<number>
  duration: Readonly<Ref<number>>
  pitchDelta: ShallowRef<number>
  pitchRange: ShallowRef<8 | 16 | 50>
  interacting: ShallowRef<boolean>
  progress: ComputedRef<number>
  bpm: Readonly<Ref<number>>
  angle: ShallowRef<number>
}

export const [injectVirtualDeckRootContext, provideVirtualDeckRootContext] =
  createContext<VirtualDeckRootContext>('VirtualDeckRoot')
</script>

<script lang="ts" setup>
import { clamp } from '@vueuse/core'
import type { WritableComputedRef } from 'vue'

const props = withDefaults(defineProps<VirtualDeckRootProps>(), {
  currentTime: 0,
  duration: 1,
  bpm: 0,
  pitchDelta: 0,
  pitchRange: 8,
  disabled: false
})

const emits = defineEmits<VirtualDeckRootEmits>()

const currentTime = useVModel(props, 'currentTime', emits, {
  defaultValue: 0
}) as WritableComputedRef<number>

const pitchDelta = computedEager(() => props.pitchDelta)
const pitchRange = computedEager(() => props.pitchRange)
const bpm = computedEager(() => props.bpm)
const duration = computedEager(() => props.duration)

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
        'aspect-square size-48 touch-none select-none md:size-48',
        'aria-disabled:opacity-50 aria-disabled:grayscale',
        'disabled:opacity-50 disabled:grayscale',
        $attrs.class ?? ''
      )
    ">
    <slot />
  </div>
</template>
