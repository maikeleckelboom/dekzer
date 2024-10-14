<script lang="ts" setup>
const uploadedFile = ref<File | null>(null)

const clearFile = () => uploadedFile.value = null

onBeforeUnmount(clearFile)

onMounted(clearFile)

function onFileChange([file]: File[]) {
	uploadedFile.value = file
}

const { metadata } = useAudioMetadata(uploadedFile)

whenever(metadata, (data) => {
	console.log('metadata', data)
})
</script>

<template>
	<DeckDropzone class="size-full flex even:flex-row-reverse" @change="onFileChange">
		<slot />
	</DeckDropzone>
</template>