export function useAudioLevelAnalyser(
  analyserNodes: MaybeRefOrGetter<AnalyserNode[]>,
  fftSize: 1024 | 2048 | 4096 = 1024
) {
  const returnValueL = shallowRef<number>(Number.NEGATIVE_INFINITY)
  const returnValueR = shallowRef<number>(Number.NEGATIVE_INFINITY)

  const floatSampleBufferL = new Float32Array(fftSize)
  const floatSampleBufferR = new Float32Array(fftSize)

  let rAF: number | null = null

  function start(algorithm: 'rms' | 'peak' = 'rms') {
    const a = toValue(analyserNodes)?.at(0)
    const b = toValue(analyserNodes)?.at(1)

    if (!a || !b) {
      throw new Error('Analyser nodes are not set')
    }

    a.getFloatTimeDomainData(floatSampleBufferL)
    b.getFloatTimeDomainData(floatSampleBufferR)

    if (algorithm === 'peak') {
      let peakInstantaneousPowerL = 0
      let peakInstantaneousPowerR = 0

      for (let i = 0; i < fftSize; i++) {
        const sampleL = floatSampleBufferL[i] as number
        const sampleR = floatSampleBufferR[i] as number

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
        const sampleL = floatSampleBufferL[i] as number
        const sampleR = floatSampleBufferR[i] as number

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
    if (rAF) {
      cancelAnimationFrame(rAF)
      rAF = null
    }
  }

  const channels = computed(() => [
    returnValueL.value ?? Number.NEGATIVE_INFINITY,
    returnValueR.value ?? Number.NEGATIVE_INFINITY
  ])

  return {
    channels,
    start,
    stop,
    valueL: returnValueL,
    valueR: returnValueR,
    isRunning: computed(() => rAF !== null)
  }
}