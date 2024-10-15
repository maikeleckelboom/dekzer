<script lang="ts">
export interface DeckRootEmits {
	trackLoaded: [file: File],
}

export interface DeckRootProps {
	trackPickerEvent?: 'dblclick' | 'click'
}
</script>

<script lang="ts" setup>
import type { DeckDropzone } from '#components'

const props = withDefaults(defineProps<DeckRootProps>(), {
	trackPickerEvent: 'dblclick'
})

const emit = defineEmits<DeckRootEmits>()

const dropzone = useTemplateRef<InstanceType<DeckDropzone>>('dropzone')

useEventListener(dropzone, props.trackPickerEvent, (event: MouseEvent) => {
	event.preventDefault()
	if (!dropzone.value) return
	dropzone.value.openFilePicker()
})

function onFileDrop([file]: File[]) {
	emit('trackLoaded', file)
}
</script>

<template>
	<DeckDropzone ref="dropzone" class="size-full flex even:flex-row-reverse" @change="onFileDrop">
		<slot />
	</DeckDropzone>
</template>