export interface AudioNodeChain {
  id: string
  nodes: AudioNode[]
  active: boolean
}

export type NodeMap = Map<string, AudioNodeChain>

export const useAudioNodeChain = createSharedComposable(() => {
  const chains: NodeMap = reactive(new Map())

  function addChain(id: string, nodes: AudioNode[]): void {
    chains.set(id, { id, nodes, active: false })
  }

  function removeChain(id: string): void {
    const chain = chains.get(id)
    if (chain) {
      chain.nodes.forEach((node) => node.disconnect())
      chains.delete(id)
    }
  }

  function clearChains(): void {
    chains.forEach((chain) => {
      chain.nodes.forEach((node) => node.disconnect())
    })
    chains.clear()
  }

  function setChainActive(id: string, isActive: boolean = true): void {
    const chain = chains.get(id)
    if (!chain) return
    chain.active = isActive
    if (isActive) {
      chain.nodes.reduce((previousNode, currentNode) => {
        previousNode.connect(currentNode)
        return currentNode
      })
    } else {
      chain.nodes.forEach((node) => node.disconnect())
    }
  }

  function connectDestination(id: string, destination: AudioNode): void {
    const chain = chains.get(id)
    if (!chain || chain.nodes.length === 0) return
    chain.nodes.at(-1)?.connect(destination)
  }

  function getChain(id: string): AudioNodeChain | undefined {
    return chains.get(id)
  }
  function logActiveChains(): void {
    chains.forEach(chain => {
      console.log(`Chain ID: ${chain.id}, Active: ${chain.active}`);
      chain.nodes.forEach((node, index) => {
        console.log(`  Node ${index}: ${node.constructor.name}`);
      });
    });
  }

  function hasChain(id: string): boolean {
    return chains.has(id)
  }


  return {
    chains,
    addChain,
    removeChain,
    clearChains,
    setChainActive,
    logActiveChains,
    connectDestination,
    getChain,
    hasChain
  }
})
