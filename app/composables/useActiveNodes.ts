export const useActiveNodes = createSharedComposable(() => {
  const activeNodes = shallowReactive(new Map() as Map<string, AudioNode>)

  function addNode(id:string, node: AudioNode) {
    activeNodes.set(id, node)
  }

  function removeNode(id: string) {
    activeNodes.delete(id)
  }

  function removeAllNodes() {
    activeNodes.clear()
  }

  function hasNode(id: string) {
    return activeNodes.has(id)
  }

  return {
    activeNodes,
    addNode,
    removeNode,
    hasNode,
    removeAllNodes
  }
})