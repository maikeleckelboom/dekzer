<script lang="ts">
export interface FaderRootProps {
  orientation?: 'horizontal' | 'vertical'
  min?: number
  max?: number
  step?: number
  inverted?: boolean
  disabled?: boolean
  dbValues?: number[]
  dbMin?: number
  dbMax?: number
  modelValue: numbe
}

export interface FaderContext {
  modelValue: Ref<number>
  orientation: Ref<'horizontal' | 'vertical'>
  min: Ref<number>
  max: Ref<number>
  step: Ref<number>
  disabled: Ref<boolean>
  offset: Ref<number>
  dbValues: Ref<number[]>
  dbMin: Ref<number>
  dbMax: Ref<number>
  width: Ref<number>
  height: Ref<number>
}

export interface FaderRootEmits {
  'update:modelValue': [payload: number]
}

export const [injectFaderRootContext, provideFaderRootContext] = createContext<FaderRootContext>(
  ['FaderRoot'],
  'FaderContext'
)
</script>

<script lang="ts" setup>
import {
  FADER_CONTAINER_SIZE,
  FADER_HANDLE_SIZE
} from '~~/layers/fader/components/utils/constants'

const props = withDefaults(defineProps<FaderRootProps>(), {
  orientation: 'horizontal',
  min: 0,
  max: 1,
  step: 0.01,
  modelValue: 0,
  dbValues: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  dbMin: -12,
  dbMax: 12,
  disabled: false,
  asChild: false
})

const { orientation, min, max, step, disabled, dbValues, dbMin, dbMax } = toRefs(props)

const emits = defineEmits<FaderRootEmits>()
const modelValue = useVModel(props, 'modelValue', emits)

const id = useId()
const offset = useState<number>(`fader-offset-${id}`, () => 0)

if (orientation.value === 'horizontal') {
  offset.value = ((modelValue.value - min.value) / (max.value - min.value)) * 100
} else {
  offset.value =
    ((max.value - modelValue.value) / (max.value - min.value)) * 100 -
    (FADER_HANDLE_SIZE / FADER_CONTAINER_SIZE) * 100
}

const rootDiv = useTemplateRef<HTMLDivElement>('rootDiv')

const { width, height } = useElementSize(rootDiv)

provideFaderRootContext({
  modelValue,
  offset,
  orientation,
  min,
  max,
  step,
  disabled,
  dbValues,
  dbMin,
  dbMax,
  width,
  height
})
</script>

<template>
  <div
    ref="rootDiv"
    :class="
      cn(
        'relative flex size-fit touch-none select-none gap-0.5',
        orientation === 'horizontal' ? `flex-col` : `flex-row`
      )
    "
    :style="{
      [orientation === 'horizontal' ? 'width' : 'height']: `${FADER_CONTAINER_SIZE}px`
    }">
    <slot />
  </div>
</template>
