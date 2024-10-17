export function useStereoVolumeMeter(
	analyzer: MaybeRefOrGetter<AnalyserNode>,
	analyserR: MaybeRefOrGetter<AnalyserNode>,
	fftSize: 1024 | 2048 | 4096 = 1024
) {
	const returnValueL = shallowRef<number>(Number.NEGATIVE_INFINITY)
	const returnValueR = shallowRef<number>(Number.NEGATIVE_INFINITY)

	const floatSampleBufferL = new Float32Array(fftSize)
	const floatSampleBufferR = new Float32Array(fftSize)

	let rAF: number | null = null

	function start(algorithm: 'rms' | 'peak' = 'rms') {
		toValue(analyzer).getFloatTimeDomainData(floatSampleBufferL)
		toValue(analyserR).getFloatTimeDomainData(floatSampleBufferR)

		if (algorithm === 'peak') {
			let peakInstantaneousPowerL = 0
			let peakInstantaneousPowerR = 0

			for (let i = 0; i < fftSize; i++) {
				const sampleL = floatSampleBufferL[i]
				const sampleR = floatSampleBufferR[i]

				const powerL = sampleL ** 2
				const powerR = sampleR ** 2

				peakInstantaneousPowerL = Math.max(powerL, peakInstantaneousPowerL)
				peakInstantaneousPowerR = Math.max(powerR, peakInstantaneousPowerR)
			}

			/* Peak Instantaneous Power in dB */
			returnValueL.value = 10 * Math.log10(peakInstantaneousPowerL)
			returnValueR.value = 10 * Math.log10(peakInstantaneousPowerR)
		} else {
			let sumOfSquaresL = 0
			let sumOfSquaresR = 0

			for (let i = 0; i < fftSize; i++) {
				const sampleL = floatSampleBufferL[i]
				const sampleR = floatSampleBufferR[i]

				sumOfSquaresL += sampleL ** 2
				sumOfSquaresR += sampleR ** 2
			}

			/* Average Power in dB */
			returnValueL.value = 10 * Math.log10(sumOfSquaresL / fftSize)
			returnValueR.value = 10 * Math.log10(sumOfSquaresR / fftSize)
		}

		rAF = requestAnimationFrame(() => start(algorithm))
	}

	function stop() {
		returnValueL.value = Number.NEGATIVE_INFINITY
		returnValueR.value = Number.NEGATIVE_INFINITY
		cancelAnimationFrame(rAF)
	}

	return {
		valueL: readonly(returnValueL),
		valueR: readonly(returnValueR),
		start,
		stop
	}
}