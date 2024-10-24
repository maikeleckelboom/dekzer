<script lang="ts">
export interface DeckRootProps {
  disabled?: boolean
  triggerEvent?: 'click' | 'dblclick'
}

export interface DeckRootEmits {
  (event: 'load', file: File): void
}
</script>

<script lang="ts" setup>
import { DeckDropzone } from '#components'

const props = withDefaults(defineProps<DeckRootProps>(), {
  disabled: false,
  triggerEvent: 'dblclick'
})

const emit = defineEmits<DeckRootEmits>()

const deckDropzone = useTemplateRef<InstanceType<typeof DeckDropzone>>('deckDropzone')

useEventListener(
  () => deckDropzone.value?.$el,
  props.triggerEvent,
  (event: Event) => {
    event.preventDefault()
    if (!props.disabled) return
    deckDropzone.value!.openFilePicker()
  },
  { passive: false, capture: true }
)

function onChange([file]: File[]) {
  if (!file) return
  emit('load', file)
}
</script>

<template>
  <DeckDropzone
    ref="deckDropzone"
    class="size-full"
    @change="onChange">
    <slot />
  </DeckDropzone>
</template>
