<script lang="ts" setup>
import type { UseFileDialogOptions } from '@vueuse/core'

const { dataTypes } = defineProps<{ dataTypes?: string[] }>()

const emit = defineEmits<{
	(ev: 'change', files: File[] | FileList): void
}>()

function handleEmit(files: File[] | FileList) {
	emit('change', files)
}

const input = useTemplateRef<HTMLDivElement>('input')

const { isOverDropZone } = useDropZone(input, {
	onDrop,
	dataTypes
})

function onDrop(files: FileList | File[] | null, _: DragEvent) {
	files = Array.from(files ?? []).filter((file) => {
		if (dataTypes && Array.isArray(dataTypes)) {
			return dataTypes.some((type) => file.type.includes(type))
		}
		return file.size > 0
	})
	if (files.length) {
		handleEmit(files)
	}
}

defineSlots<{ default: void }>()

defineExpose({
	isOverDropZone
})

function openFilePicker(options?: UseFileDialogOptions) {
	const handle = useFileDialog({
		directory: false,
		multiple: false,
		accept: Array.isArray(dataTypes) ? dataTypes.join(',') : '*'
	})
	handle.open()
	handle.onChange((files: FileList | null) => {
		if (files) emit('change', files)
		handle.reset()
	})
}
</script>

<template>
	<div ref="input">
		<slot />
	</div>
</template>
