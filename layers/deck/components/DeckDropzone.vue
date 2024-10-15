<script lang="ts" setup>
import type { UseFileDialogOptions } from '@vueuse/core'

const {
	dataTypes,
	...props
} = defineProps<UseFileDialogOptions>()

const emit = defineEmits<{
	(ev: 'change', files: File[]): void
}>()

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
		emit('change', files)
	}
}

async function openFilePicker(options?: UseFileDialogOptions): void {
	const handle = useFileDialog({
		accept: Array.isArray(dataTypes) ? dataTypes.join(',') : '*',
		...props,
		...options
	})
	handle.open()
	handle.onChange((files: FileList | null) => {
		if (files) emit('change', files)
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
	<div ref="input">
		<slot />
	</div>
</template>
