interface UseAudioAnalyserOptions {
  fftSize: 1024 | 2048 | 4096
}

interface AnalyserValues {
  rms: number;
  peak: number
}

export function useAudioAnalyser(
  analysers: MaybeRefOrGetter<AnalyserNode[]> | undefined,
  options: UseAudioAnalyserOptions = {
    fftSize: 2048
  }
) {
  const { fftSize = 2048 } = options || {}

  const valuesL = reactive<AnalyserValues>({
    rms: Number.NEGATIVE_INFINITY,
    peak: Number.NEGATIVE_INFINITY
  })

  const valuesR = reactive<AnalyserValues>({
    rms: Number.NEGATIVE_INFINITY,
    peak: Number.NEGATIVE_INFINITY
  })

  const floatSampleBufferL = new Float32Array(fftSize)
  const floatSampleBufferR = new Float32Array(fftSize)

  let rAF: number | null = null

  function start() {
    const analyserNodes = toValue(analysers) || []

    if (analyserNodes.length === 0) {
      return
    }

    const analyserL = analyserNodes.at(0)
    const analyserR = analyserNodes?.at(1) || analyserL
    if (!analyserL || !analyserR) {
      return
    }

    analyserL.getFloatTimeDomainData(floatSampleBufferL)
    analyserR.getFloatTimeDomainData(floatSampleBufferR)

    let peakInstantaneousPowerL = 0
    let peakInstantaneousPowerR = 0
    let sumOfSquaresL = 0
    let sumOfSquaresR = 0

    for (let i = 0; i < fftSize; i++) {
      const sampleL = floatSampleBufferL.at(i) || 0
      const sampleR = floatSampleBufferR.at(i) || 0

      const powerL = sampleL ** 2
      const powerR = sampleR ** 2

      peakInstantaneousPowerL = Math.max(powerL, peakInstantaneousPowerL)
      peakInstantaneousPowerR = Math.max(powerR, peakInstantaneousPowerR)

      sumOfSquaresL += sampleL ** 2
      sumOfSquaresR += sampleR ** 2
    }

    /* Peak Instantaneous Power in dB */
    valuesL.peak = 10 * Math.log10(peakInstantaneousPowerL)
    valuesR.peak = 10 * Math.log10(peakInstantaneousPowerR)

    /* Average Power in dB */
    valuesL.rms = 10 * Math.log10(sumOfSquaresL / fftSize)
    valuesR.rms = 10 * Math.log10(sumOfSquaresR / fftSize)

    rAF = requestAnimationFrame(start)
  }

  function stop() {
    valuesL.peak = valuesR.peak = Number.NEGATIVE_INFINITY
    valuesL.rms = valuesR.rms = Number.NEGATIVE_INFINITY

    if (rAF) {
      cancelAnimationFrame(rAF)
      rAF = null
    }
  }

  return {
    start,
    stop,
    valuesL,
    valuesR
  }
}
