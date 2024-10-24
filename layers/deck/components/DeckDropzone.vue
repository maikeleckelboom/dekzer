<script lang="ts" setup>
import type { UseFileDialogOptions } from '@vueuse/core'

const props = defineProps<UseFileDialogOptions & { dataTypes?: string[] }>()

const emit = defineEmits<{
  (ev: 'change', files: File[]): void
}>()

const element = useTemplateRef<HTMLDivElement>('element')

const { isOverDropZone } = useDropZone(element, {
  onDrop,
  dataTypes: props.dataTypes
})

function onDrop(files: FileList | File[] | null, _: DragEvent) {
  files = Array.from(files ?? []).filter((file) => {
    if (props.dataTypes && Array.isArray(props.dataTypes)) {
      return props.dataTypes.some((type) => file.type.includes(type))
    }
    return file.size > 0
  })
  if (files.length) {
    emit('change', files)
  }
}

async function openFilePicker(options?: UseFileDialogOptions): Promise<void> {
  const handle = useFileDialog({
    accept: Array.isArray(props.dataTypes) ? props.dataTypes.join(',') : '*',
    multiple: options?.multiple ?? false,
    directory: options?.directory ?? false
  })
  handle.open()
  handle.onChange((files: FileList | null) => {
    if (files) emit('change', Array.from(files))
    handle.reset()
  })
}

defineExpose({
  isOverDropZone,
  openFilePicker
})

defineSlots<{ default: void }>()
</script>

<template>
  <div ref="element">
    <slot />
  </div>
</template>
