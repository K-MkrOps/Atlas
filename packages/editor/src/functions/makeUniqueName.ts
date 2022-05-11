import { EntityTreeNode } from '@atlas/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@atlas/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@atlas/engine/src/ecs/functions/SystemHooks'
import { NameComponent } from '@atlas/engine/src/scene/components/NameComponent'

const namePattern = new RegExp('(.*) \\d+$')

function getNameWithoutIndex(name) {
  let cacheName = name
  const match = namePattern.exec(name)
  if (match) {
    cacheName = match[1]
  }
  return cacheName
}

export default function makeUniqueName(node: EntityTreeNode, world = useWorld()) {
  let counter = 0

  const nodeNameComp = getComponent(node.entity, NameComponent)
  const nameWithoutIndex = getNameWithoutIndex(nodeNameComp.name)

  traverseEntityNode(world.entityTree.rootNode, (child) => {
    if (child.entity === node.entity) return

    const nameComponent = getComponent(child.entity, NameComponent)
    if (!nameComponent.name.startsWith(nameWithoutIndex)) return

    const parts = nameComponent.name.split(nameWithoutIndex)

    if (parts[0]) return // if child's name starts with given object's name then first part will be empty string ('')

    // Second part of the name will be empty string ('') for first child which name does not have '1' suffix
    const num = parts[1] ? parseInt(parts[1]) : 1

    if (num > counter) {
      counter = num
    }
  })

  nodeNameComp.name = nameWithoutIndex + (counter > 0 ? ' ' + (counter + 1) : '')
}
