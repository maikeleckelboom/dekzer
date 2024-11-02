export interface AudioNodeChain {
  id: string
  nodes: Record<string, AudioNode>
  connected: boolean
}

export type AudioNodeMap = Map<string, AudioNodeChain>

export const useAudioNodeChain = createSharedComposable(() => {

  const chains: AudioNodeMap = reactive(new Map())

  function add(id: string, nodes: Record<string, AudioNode>, options?: { connect: boolean }): void {
    const { connect = false } = options || {}
    chains.set(id, { id, nodes, connected: connect })
    if (connect) {
      connectNodes(id)
    }
  }

  function remove(id: string): void {
    const chain = get(id)
    Object.values(chain.nodes).forEach((node) => node.disconnect())
    chains.delete(id)
  }

  function get(id: string) {
    const chain = chains.get(id)

    if (!chain || !Object.keys(chain.nodes).length) {
      throw new Error(`Chain with id ${id} not found`)
    }

    return chain
  }

  function getOutputNode(id: string) {
    const chain = get(id)

    if (Object.keys(chain.nodes).length === 0) {
      throw new Error(`Chain with id ${id} has no nodes`)
    }

    return Object.values(chain.nodes).at(-1) as AudioNode
  }

  function getInputNode(id: string) {
    const chain = get(id)

    if (Object.keys(chain.nodes).length === 0) {
      throw new Error(`Chain with id ${id} has no nodes`)
    }

    return Object.values(chain.nodes).at(0) as AudioNode
  }

  function getCrossfadeGainNode(id: string) {
    const chain = get(id)
    return chain.nodes.crossfade as GainNode
  }

  function getGainNode(id: string) {
    const chain = get(id)
    return chain.nodes.gain as GainNode
  }

  function getAmplifierNode(id: string) {
    const chain = get(id)
    return chain.nodes.amplifier as GainNode
  }

  function connectNodes(id: string) {
    const chain = get(id)
    const chainNodes = Object.values(chain.nodes)

    chainNodes.forEach((node, index) => {
      if (index < chainNodes.length - 1) {
        node.connect(chainNodes.at(index + 1) as AudioNode)
      }
    })

    chain.connected = true
  }

  return {
    chains: readonly(chains),
    add,
    remove,
    get,
    getOutputNode,
    getInputNode,
    getCrossfadeGainNode,
    getGainNode,
    getAmplifierNode
  }
})