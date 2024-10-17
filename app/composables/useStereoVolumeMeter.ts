import { NEGATIVE_INFINITY } from '@vue/devtools-kit'

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
// function useChannelLevelMeter(fttSize: 1024 | 2048 | 4096 = 1024) {
// 	const returnValue = shallowRef<number>(Number.MIN_VALUE)
// 	const floatSampleBuffer = new Float32Array(fttSize)
//
// 	let rAF: number | null = null
//
// 	function start(algorithm: 'rms' | 'peak' = 'rms') {
// 		if (algorithm === 'peak') {
// 			let peakInstantaneousPower = 0
// 			for (let i = 0; i < floatSampleBuffer.length; i++) {
// 				const sample = floatSampleBuffer[i]
// 				if (sample) {
// 					const power = sample ** 2
// 					peakInstantaneousPower = Math.max(power, peakInstantaneousPower)
// 				}
// 			}
// 			// /* Peak Instantaneous Power in dB */
// 			returnValue.value = 10 * Math.log10(peakInstantaneousPower)
// 		} else {
// 			let sumOfSquares = 0
// 			for (let i = 0; i < floatSampleBuffer.length; i++) {
// 				const sample = floatSampleBuffer[i]
// 				if (sample) {
// 					sumOfSquares += sample ** 2
// 				}
// 			}
// 			// /* Average Power in dB */
// 			returnValue.value = 10 * Math.log10(sumOfSquares / floatSampleBuffer.length)
// 		}
//
// 		rAF = requestAnimationFrame(start)
// 	}
//
// 	function stop() {
// 		cancelAnimationFrame(rAF)
// 	}
//
// 	return {
// 		value: readonly(returnValue),
// 		start,
// 		stop
// 	}
// }

/*
export function useDecibelAnalyzer(
	analyzerNodeL: ShallowRef<AnalyserNode>,
	analyzerNodeR: ShallowRef<AnalyserNode>,
	type: MaybeRefOrGetter<'rms' | 'peak'> = 'rms'
) {
	const channelL = shallowRef(Number.NEGATIVE_INFINITY)
	const channelR = shallowRef(Number.NEGATIVE_INFINITY)

	function calculateRmsAmplitude(data: Uint8Array) {
		const sum = data.reduce((acc, value) => acc + (value / 128.0 - 1.0) ** 2, 0)
		return Math.sqrt(sum / data.length)
	}

	function calculatePeakAmplitude(data: Uint8Array) {
		let max = 0
		for (let i = 0; i < data.length; i++) {
			const abs = Math.abs(data.at(i)! / 128.0 - 1.0)
			max = Math.max(abs, max)
		}
		return max
	}

	function calculateDBFS(data: Uint8Array) {
		const amplitude = toValue(type) === 'rms' ? calculateRmsAmplitude(data) : calculatePeakAmplitude(data)
		return 20 * Math.log10(amplitude + 1e-10)
	}

	function updateDecibelMeters() {
		const nodeL = toValue(analyzerNodeL)
		const nodeR = toValue(analyzerNodeR)

		if (!nodeL || !nodeR) {
			console.warn('Unable to update decibel meters, analyzer nodes are not ready')
			return
		}

		const dataArrayL = new Uint8Array(nodeL.fftSize)
		const dataArrayR = new Uint8Array(nodeR.fftSize)

		nodeL.getByteTimeDomainData(dataArrayL)
		nodeR.getByteTimeDomainData(dataArrayR)

		channelL.value = calculateDBFS(dataArrayL)
		channelR.value = calculateDBFS(dataArrayR)
	}

	return [channelL, channelR, updateDecibelMeters]
}
*/
