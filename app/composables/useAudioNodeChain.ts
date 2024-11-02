export interface AudioNodeChain {
  id: string
  nodes: AudioNode[]
  connected: boolean
}

export type NodeMap = Map<string, AudioNodeChain>

export const useAudioNodeChain = createSharedComposable(() => {
  const chains: NodeMap = reactive(new Map())

  function add(id: string, nodes: AudioNode[], options?: { connect: boolean }): void {
    const { connect = false } = options || {}
    chains.set(id, { id, nodes, connected: connect })
    if (connect) {
      connectNodes(id)
    }
  }

  function remove(id: string): void {
    const chain = get(id)
    chain.nodes.forEach((node) => node.disconnect())
    chains.delete(id)
  }

  function get(id: string) {
    const chain = chains.get(id)

    if (!chain || !chain.nodes?.length) {
      throw new Error(`Chain with id ${id} not found`)
    }

    return chain
  }

  function getOutputNode(id: string) {
    const chain = get(id)

    if (chain.nodes.length === 0) {
      throw new Error(`Chain with id ${id} has no nodes`)
    }

    return chain.nodes.at(-1) as AudioNode
  }

  function getInputNode(id: string) {
    const chain = get(id)

    if (chain.nodes.length === 0) {
      throw new Error(`Chain with id ${id} has no nodes`)
    }

    return chain.nodes.at(0) as AudioNode
  }

  function getCrossfadeGain(id: string) {
    const chain = get(id)
    return chain.nodes.at(4) as GainNode
  }

  function connectNodes(id: string, connected: boolean = true): void {
    const chain = get(id)
    chain.connected = connected

    if (connected) {
      chain.nodes.reduce((previousNode, currentNode) => {
        previousNode.connect(currentNode)
        return currentNode
      })
    } else {
      chain.nodes.forEach((node) => node.disconnect())
    }
  }

  return {
    chains,
    add,
    get,
    connectNodes,
    inputNode: getInputNode,
    outputNode: getOutputNode,
    getCrossfadeGain,
    remove,
  }
})
