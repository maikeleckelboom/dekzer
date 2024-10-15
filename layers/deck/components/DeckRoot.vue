<script lang="ts">

export interface DeckRootProps {
	loadTrackTrigger?: 'click' | 'dblclick'
}

export interface DeckRootEmits {
	trackLoaded: [file: File],
}
</script>

<script lang="ts" setup>
import type { DeckDropzone } from '#components'

const props = withDefaults(defineProps<DeckRootProps>(), {
	loadTrackTrigger: 'dblclick'
})

const emit = defineEmits<DeckRootEmits>()

const deckDropzone = useTemplateRef<InstanceType<DeckDropzone>>('deckDropzone')

useEventListener(deckDropzone, props.loadTrackTrigger, (event: Event) => {
	event.preventDefault()
	if (!deckDropzone.value) return
	deckDropzone.value.openFilePicker()
})

function onFileDrop([file]: File[]) {
	emit('trackLoaded', file)
}
</script>

<template>
	<DeckDropzone ref="deckDropzone" class="size-full flex even:flex-row-reverse" @change="onFileDrop">
		<slot />
	</DeckDropzone>
</template>