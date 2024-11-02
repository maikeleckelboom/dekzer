interface AudioAmplitudeMeterOptions {
  fftSize: 1024 | 2048 | 4096
}

export function useAudioAmplitudeMeter(
  analysers: MaybeRefOrGetter<AnalyserNode[]>|undefined,
  options: AudioAmplitudeMeterOptions = {
    fftSize: 2048
  }
) {
  const { fftSize = 2048 } = options || {}

  const returnValueL = reactive<{ rms: number; peak: number }>({
    rms: Number.NEGATIVE_INFINITY,
    peak: Number.NEGATIVE_INFINITY
  })
  const returnValueR = reactive<{ rms: number; peak: number }>({
    rms: Number.NEGATIVE_INFINITY,
    peak: Number.NEGATIVE_INFINITY
  })

  const floatSampleBufferL = new Float32Array(fftSize)
  const floatSampleBufferR = new Float32Array(fftSize)

  let rAF: number | null = null

  function start() {
    const analyserNodes = toValue(analysers) || []
    const leftChannel = analyserNodes.at(0)
    if (!leftChannel) {
      return
    }

    const rightChannel = analyserNodes?.at(1) || leftChannel

    leftChannel.getFloatTimeDomainData(floatSampleBufferL)
    rightChannel.getFloatTimeDomainData(floatSampleBufferR)

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
    returnValueL.peak = 10 * Math.log10(peakInstantaneousPowerL)
    returnValueR.peak = 10 * Math.log10(peakInstantaneousPowerR)

    /* Average Power in dB */
    returnValueL.rms = 10 * Math.log10(sumOfSquaresL / fftSize)
    returnValueR.rms = 10 * Math.log10(sumOfSquaresR / fftSize)

    rAF = requestAnimationFrame(start)
  }

  function stop() {
    returnValueL.peak = returnValueR.peak = Number.NEGATIVE_INFINITY
    returnValueL.rms = returnValueR.rms = Number.NEGATIVE_INFINITY

    if (rAF) {
      cancelAnimationFrame(rAF)
      rAF = null
    }
  }

  return {
    start,
    stop,
    returnValueL,
    returnValueR
  }
}
