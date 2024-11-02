export interface AudioNodeChain {
  id: string
  nodes: AudioNode[]
  connected: boolean
}

export type NodeMap = Map<string, AudioNodeChain>

export const useAudioNodeChain = createSharedComposable(() => {
  const chains: NodeMap = reactive(new Map())

  function addChain(id: string, nodes: AudioNode[]): void {
    chains.set(id, { id, nodes, connected: false })
  }

  function removeChain(id: string): void {
    const chain = getChain(id)
    chain.nodes.forEach((node) => node.disconnect())
    chains.delete(id)
  }

  function connectChainNodes(id: string, connected: boolean = true): void {
    const chain = getChain(id)
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

  function getChain(id: string) {
    const chain = chains.get(id)

    if (!chain) {
      throw new Error(`Chain with id ${id} not found`)
    }

    return chain
  }

  function getOutputNode(id: string) {
    const chain = getChain(id)

    if (chain.nodes.length === 0) {
      throw new Error(`Chain with id ${id} has no nodes`)
    }

    return chain.nodes.at(-1) as AudioNode
  }

  function getInputNode(id: string) {
    const chain = getChain(id)

    if (chain.nodes.length === 0) {
      throw new Error(`Chain with id ${id} has no nodes`)
    }

    return chain.nodes.at(0) as AudioNode
  }

  return {
    chains,
    addChain,
    getChain,
    getOutputNode,
    connectChainNodes,
    getInputNode,
    removeChain
  }
})
