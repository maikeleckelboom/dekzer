<script lang="ts">
import { type PrimitiveProps } from 'radix-vue'

export interface FaderRootProps extends PrimitiveProps {
  orientation?: 'horizontal' | 'vertical'
  min?: number
  max?: number
  step?: number
  inverted?: boolean
  disabled?: boolean
  defaultValue?: number
  modelValue: number
}

export interface FaderRootContext {
  modelValue: Ref<number>
  orientation: Ref<'horizontal' | 'vertical'>
  min: Ref<number>
  max: Ref<number>
  step: Ref<number>
  inverted: Ref<boolean>
  disabled: Ref<boolean>
}

export interface FaderRootEmits {
  'update:modelValue': [payload: number]
}

export const [injectFaderRootContext, provideFaderRootContext] =
  createContext<FaderRootContext>('SliderRoot')
</script>

<script lang="ts" setup>
import { Primitive } from 'radix-vue'

const props = withDefaults(defineProps<FaderRootProps>(), {
  orientation: 'horizontal',
  min: 0,
  max: 1,
  step: 0.01,
  defaultValue: 0,
  inverted: false,
  disabled: false,
  asChild: false,
  as: 'div'
})

const {
  orientation,
  min,
  max,
  step,
  inverted,
  disabled,
  modelValue,
  as: asTag,
  asChild
} = toRefs(props)

const emits = defineEmits<FaderRootEmits>()

provideFaderRootContext({
  modelValue,
  orientation,
  min,
  max,
  step,
  inverted,
  disabled
})
</script>

<template>
  <Primitive
    :as="asTag"
    :as-child="asChild"
    :class="
      cn(
        'relative flex size-fit touch-none select-none gap-0.5',
        orientation === 'horizontal' ? 'flex-col' : 'flex-row'
      )
    ">
    <slot />
  </Primitive>
</template>
