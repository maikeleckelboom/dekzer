<script lang="ts">
export interface DeckRootProps {
	active?: boolean
	browseTrigger?: 'click' | 'dblclick'
}

export interface DeckRootEmits {
	trackLoaded: [file: File],
}
</script>

<script lang="ts" setup>
import type { DeckDropzone } from '#components'

// TODO: Refactor (change active prop to something more meaningful)

const props = withDefaults(defineProps<DeckRootProps>(), {
	active: false,
	browseTrigger: 'dblclick'
})

const emit = defineEmits<DeckRootEmits>()

const deckDropzone = useTemplateRef<InstanceType<DeckDropzone>>('deckDropzone')

useEventListener(deckDropzone, props.browseTrigger, (event: Event) => {
	if (!deckDropzone.value || props.active) return
	deckDropzone.value.openFilePicker()
}, { passive: true })

function onChange([file]: File[]) {
	emit('trackLoaded', file)
}
</script>

<template>
	<DeckDropzone ref="deckDropzone" class="size-full" @change="onChange">
		<slot />
	</DeckDropzone>
</template>