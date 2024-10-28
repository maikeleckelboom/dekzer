export interface DeckNodes {
  gain: GainNode
  hi: BiquadFilterNode
  mid: BiquadFilterNode
  low: BiquadFilterNode
  analyserL: AnalyserNode
  analyserR: AnalyserNode
  volume: GainNode
  pan: GainNode
  limiter: DynamicsCompressorNode
}

export interface MasterNodes {
  gain: GainNode
  limiter: DynamicsCompressorNode
  analyserL: AnalyserNode
  analyserR: AnalyserNode
}

/**
 * Deck A: Gain -> Hi -> Mid -> Low -> Volume -> Analysers -> Pan -> Limiter ->
 *                                                                      | -> Master FX -> Master Limiter -> Master Output
 * Deck B: Gain -> Hi -> Mid -> Low -> Volume -> Analysers -> Pan -> Limiter ->
 */
export function useAudioGraph(){
  const {audioContext, getAudioContext} = useAudioContext()

  function createDeckNodes(context:AudioContext):DeckNodes{
    const gain = context.createGain()
    const hi = context.createBiquadFilter()
    const mid = context.createBiquadFilter()
    const low = context.createBiquadFilter()
    const analyserL = context.createAnalyser()
    const analyserR = context.createAnalyser()
    const volume = context.createGain()
    const pan = context.createGain()
    const limiter = createLimiter(context,'track')

    return {
      gain,
      hi,
      mid,
      low,
      volume,
      analyserL,
      analyserR,
      pan,
      limiter
    }
  }

  async function createDeck(context:AudioContext){
    const nodes = createDeckNodes(context)

    nodes.gain.connect(nodes.hi)
    nodes.hi.connect(nodes.mid)
    nodes.mid.connect(nodes.low)
    nodes.low.connect(nodes.volume)
    nodes.volume.connect(nodes.analyserL)
    nodes.volume.connect(nodes.analyserR)
    nodes.volume.connect(nodes.pan)
    nodes.pan.connect(nodes.limiter)

    return {
      nodes,
      disconnect(){
        nodes.gain.disconnect()
        nodes.hi.disconnect()
        nodes.mid.disconnect()
        nodes.low.disconnect()
        nodes.analyserL.disconnect()
        nodes.analyserR.disconnect()
        nodes.volume.disconnect()
        nodes.pan.disconnect()
        nodes.limiter.disconnect()
      }
    }
  }

  function createMasterNodes(context:AudioContext):MasterNodes{
    const gain = context.createGain()
    const limiter = createLimiter(context,'master')
    const analyserL = context.createAnalyser()
    const analyserR = context.createAnalyser()

    return {
      gain,
      limiter,
      analyserL,
      analyserR
    }
  }

  async function createMaster(context:AudioContext){
    const nodes = createMasterNodes(context)

    nodes.gain.connect(nodes.limiter)
    nodes.limiter.connect(nodes.analyserL)
    nodes.limiter.connect(nodes.analyserR)

    return {
      nodes,
      disconnect(){
        nodes.gain.disconnect()
        nodes.limiter.disconnect()
        nodes.analyserL.disconnect()
        nodes.analyserR.disconnect()
      }
    }
  }

  async function createAudioGraph(){
    const context = await getAudioContext()
    const deckA = await createDeck(context)
    const deckB = await createDeck(context)
    const master = await createMaster(context)

    master.nodes.gain.connect(master.nodes.analyserL)
    master.nodes.gain.connect(master.nodes.analyserR)
    master.nodes.limiter.connect(context.destination)

    return {
      deckA,
      deckB,
      master,
      disconnect(){
        deckA.disconnect()
        deckB.disconnect()
        master.disconnect()
      }
    }
  }

  return {
    getAudioContext,
    createAudioGraph
  }
}