<script lang="ts">
export interface FaderRootProps {
  orientation?: 'horizontal' | 'vertical'
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  modelValue: number
}

export interface FaderContext {
  modelValue: Ref<number>
  orientation: Ref<'horizontal' | 'vertical'>
  min: Ref<number>
  max: Ref<number>
  step: Ref<number>
  disabled: Ref<boolean>
  offset: Ref<number>
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
import { FADER_DEFAULT_SIZE, FADER_DEFAULT_HANDLE_SIZE } from '~~/layers/fader/utils/constants'

const props = withDefaults(defineProps<FaderRootProps>(), {
  orientation: 'horizontal',
  min: 0,
  max: 1,
  step: 0.01,
  modelValue: 0,
  disabled: false
})

const { orientation, min, max, step, disabled } = toRefs(props)

const emits = defineEmits<FaderRootEmits>()
const modelValue = useVModel(props, 'modelValue', emits)

const id = useId()
const offset = useState<number>(`fader-offset-${id}`, () => 0)

if (orientation.value === 'horizontal') {
  offset.value = ((modelValue.value - min.value) / (max.value - min.value)) * 100
} else {
  offset.value =
    ((max.value - modelValue.value) / (max.value - min.value)) * 100 -
    (FADER_DEFAULT_HANDLE_SIZE / FADER_DEFAULT_SIZE) * 100
}

const root = useTemplateRef<HTMLDivElement>('root')

const { width, height } = useElementSize(root)

provideFaderRootContext({
  modelValue,
  offset,
  orientation,
  min,
  max,
  step,
  disabled,
  width,
  height
})
</script>

<template>
  <div
    ref="root"
    :class="
      cn(
        'relative flex size-fit touch-none select-none gap-0.5',
        orientation === 'horizontal' ? `flex-col max-h-fit` : `max-w-fit flex-row`
      )
    ">
    <slot />
  </div>
</template>
