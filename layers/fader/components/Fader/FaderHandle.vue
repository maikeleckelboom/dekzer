<script lang="ts" setup>
import { type FaderContext, injectFaderRootContext } from '~~/layers/fader/components/Fader/FaderRoot.vue'
import { FADER_DEFAULT_HANDLE_SIZE } from '~~/layers/fader/utils/constants'

const { offset, disabled, orientation, min, max, step, modelValue, width, height } =
  injectFaderRootContext({
    min: ref(0),
    max: ref(1),
    step: ref(0.01),
    modelValue: ref(0),
    offset: ref(0),
    disabled: ref(false),
    orientation: ref('horizontal'),
    width: ref(0),
    height: ref(0),
    defaultValue: ref(0.5)
  }) as FaderContext

const STICK_THRESHOLD_CENTER:boolean = true

const isHorizontal = computed(() => orientation.value === 'horizontal')
const containerSize = computed(() => (unref(isHorizontal) ? width.value : height.value))

const { translucent = true } = defineProps<{
  translucent?: boolean
}>()

const startOffset = ref<number>(0)

const target = useTemplateRef<HTMLDivElement>('handle')
const { distanceX, distanceY, isSwiping, direction } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: 0,
  onSwipeStart(e: PointerEvent) {
    e.preventDefault()
    startOffset.value = offset.value
  },
  onSwipe(e: PointerEvent) {
    const inverter = -1
    const distance = unref(isHorizontal) ? unref(distanceX) : unref(distanceY)
    const progress = unref(startOffset) + (distance / unref(containerSize)) * 100 * inverter

    const delta = (FADER_DEFAULT_HANDLE_SIZE / unref(containerSize)) * 100
    offset.value = clamp(progress, 0, 100 - delta)

    const baseValue = unref(isHorizontal)
      ? unref(offset) / (100 - delta)
      : 1 - unref(offset) / (100 - delta)
    const rawValue = baseValue * (unref(max) - unref(min)) + unref(min)
    const stepValue = Math.round(rawValue / unref(step)) * unref(step)
    modelValue.value = clamp(stepValue, unref(min), unref(max))
  }
})
</script>

<template>
  <div
    ref="handle"
    :aria-disabled="disabled"
    :aria-orientation="orientation"
    :aria-valuemax="max"
    :aria-valuemin="min"
    :aria-valuenow="modelValue"
    :class="
      cn(
        'absolute flex cursor-grab touch-none select-none rounded-[2px] bg-black active:cursor-grabbing',
        'subpixel-antialiased [image-rendering:pixelated] transition-none',
        '[clip-path:polygon(0%_0%,_100%_0%,_95%_50%,_100%_100%,_0%_100%,_5%_50%)]',
        translucent
          ? 'opacity-50 transition-opacity duration-75 ease-in-out hover:opacity-75 active:opacity-100'
          : 'border-muted/75 border p-1',
        isHorizontal
          ? `h-full flex-row`
          : `w-full flex-col `
      )
    "
    :data-swiping="isSwiping"
    :style="{
      [isHorizontal ? 'left' : 'top']: `${offset}%`,
      [isHorizontal ? 'top' : 'left']: '0%',
      [isHorizontal ? 'width' : 'height']: `${FADER_DEFAULT_HANDLE_SIZE}px`,

    }"
    :tabindex="disabled ? undefined : 0"
    role="slider">
    <div
      :class="cn('rounded-[2px] bg-black', isHorizontal ? `h-full w-[40%]` : `h-[40%] w-full`)" />
    <div
      :class="cn('rounded-[1px] bg-white', isHorizontal ? `h-full w-[10%]` : `h-[10%] w-full`)" />
    <div
      :class="cn('rounded-[2px] bg-black', isHorizontal ? `h-full w-[40%]` : `h-[40%] w-full`)" />
  </div>
</template>
