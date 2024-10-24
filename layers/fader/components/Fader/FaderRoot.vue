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
  (event: 'update:modelValue', value: number): void
}

export const [injectFaderRootContext, provideFaderRootContext] = createContext<FaderContext>(
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

const handleOffset  =FADER_DEFAULT_HANDLE_SIZE / FADER_DEFAULT_SIZE * 100 / 2

if (orientation.value === 'horizontal') {
  offset.value = ((modelValue.value - min.value) / (max.value - min.value)) * 100 - handleOffset
} else {
  offset.value =
    ((max.value - modelValue.value) / (max.value - min.value)) * 100 - handleOffset
}

const rootElement = useTemplateRef<HTMLDivElement>('root')

const { width, height } = useElementSize(rootElement)

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
        'relative flex touch-none select-none gap-0.5 h-full',
        orientation === 'horizontal' ? `flex-col` : `flex-row`
      )
    ">
    <slot />
  </div>
</template>
