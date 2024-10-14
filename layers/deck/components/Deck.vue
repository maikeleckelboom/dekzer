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
	console.log(data)
})


</script>

<template>
	<DeckDropzone class="size-full p-4 flex" @change="onFileChange">
		<slot />
	</DeckDropzone>
</template>