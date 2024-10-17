<script lang="ts">
export interface DeckRootProps {
	disabled?: boolean
	triggerEvent?: 'click' | 'dblclick'
}

export interface DeckRootEmits {
	load: [file: File],
}
</script>

<script lang="ts" setup>
import type { DeckDropzone } from '#components'

const props = withDefaults(defineProps<DeckRootProps>(), {
	disabled: false,
	triggerEvent: 'dblclick'
})

const emit = defineEmits<DeckRootEmits>()

const deckDropzone = useTemplateRef<InstanceType<DeckDropzone>>('deckDropzone')

useEventListener(deckDropzone, props.triggerEvent, (event: Event) => {
	if (!props.disabled) return
	deckDropzone.value!.openFilePicker()
}, { passive: true })

function onChange([file]: File[]) {
	emit('load', file)
}
</script>

<template>
	<DeckDropzone ref="deckDropzone" class="size-full" @change="onChange">
		<slot />
	</DeckDropzone>
</template>