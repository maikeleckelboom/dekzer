const minGain: number = -12 as const
const maxGain: number = 12 as const
const initialGain: number = 3 as const

export const useMasterGain = createSharedComposable(() => {
	const masterGain = useState<number>('masterGain', () => initialGain)


	return { masterGain, minGain, maxGain }
})