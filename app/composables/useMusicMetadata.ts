import { type IAudioMetadata, parseWebStream } from 'music-metadata'

export function useMusicMetadata(url: MaybeRefOrGetter<string | null>, file: MaybeRefOrGetter<File | null>, options: {
	immediate?: boolean
} = {}) {
	const metadata = shallowRef<IAudioMetadata | null>(null)
	const status = shallowRef<'idle' | 'pending' | 'success' | 'error'>('idle')
	const error = shallowRef<Error | null>(null)

	async function fetchMetadata(url: string, file: File): Promise<IAudioMetadata> {
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
		const urlValue = toValue(url)
		const fileValue = toValue(file)


		if (!urlValue || !fileValue) {
			metadata.value = null
			status.value = 'idle'
			return
		}

		status.value = 'pending'

		try {
			const musicMetadata = await fetchMetadata(urlValue, fileValue)
			metadata.value = musicMetadata
			status.value = 'success'
			return musicMetadata
		} catch (err) {
			error.value = err
			status.value = 'error'
		}
	}

	watch([() => toValue(url), () => toValue(file)], refresh, { immediate: options.immediate })

	return { metadata, status, error, refresh }
}
