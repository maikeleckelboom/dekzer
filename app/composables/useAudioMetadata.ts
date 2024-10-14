import { type IAudioMetadata, parseWebStream } from 'music-metadata'

export function useAudioMetadata(file: MaybeRefOrGetter<File | null>, options: {
	immediate?: boolean
} = {}) {

	const metadata = shallowRef<IAudioMetadata | null>(null)
	const status = shallowRef<'idle' | 'pending' | 'success' | 'error'>('idle')
	const error = shallowRef<Error | null>(null)

	async function fetchMetadata(file: File): Promise<IAudioMetadata> {
		const url = URL.createObjectURL(toValue(file))
		const response = await fetch(url, {
			headers: { 'ResponseType': 'stream' }
		})
		return await parseWebStream(response.body, {
			mimeType: file.type,
			size: file.size,
			url
		})
	}

	async function refresh(): Promise<IAudioMetadata | void> {
		const fileValue = toValue(file)

		if (!fileValue) {
			metadata.value = null
			status.value = 'idle'
			return
		}

		error.value = null
		status.value = 'pending'

		try {
			const musicMetadata = await fetchMetadata(fileValue)
			metadata.value = musicMetadata
			status.value = 'success'
			return musicMetadata
		} catch (err) {
			error.value = err
			status.value = 'error'
		}
	}

	watch(() => toValue(file), refresh, { immediate: options.immediate })

	return { metadata, status, error, refresh }
}
