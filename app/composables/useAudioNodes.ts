export const useAudioNodes = createSharedComposable(()=>{
  const nodes = reactive(new Map<string, AudioNode>())

  function addNode(id: string, node: AudioNode){
    nodes.set(id, node)
  }

  function removeNode(id: string){
    nodes.delete(id)
  }

  function removeAllNodes(){
    nodes.clear()
  }

  function hasNode(id: string){
    return nodes.has(id)
  }

  return {
    nodes,
    addNode,
    removeNode,
    removeAllNodes,
    hasNode
  }
})


function useConnectNodes(){
  const { nodes } = useAudioNodes()

  function connectNodes(){
    const nodeArray = Array.from(nodes.values())
    nodeArray.reduce((previousNode, currentNode)=>{
      previousNode.connect(currentNode)
      return currentNode
    })
  }

  return {
    connectNodes
  }
}