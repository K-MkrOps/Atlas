import { World } from '@atlas/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@atlas/engine/src/ecs/functions/EntityFunctions'
import {
  iterateEntityNode,
  removeEntityNodeFromParent,
  reparentEntityNode
} from '@atlas/engine/src/ecs/functions/EntityTreeFunctions'

import { AssetComponent, AssetLoadedComponent, LoadState } from '../components/AssetComponent'
import { reparentObject3D } from '../functions/ReparentFunction'

export default async function AssetSystem(world: World) {
  const assetQuery = defineQuery([AssetComponent, AssetLoadedComponent])

  const nodeMap = () => world.entityTree.entityNodeMap
  return () => {
    for (const entity of assetQuery.enter()) {
      const asset = getComponent(entity, AssetComponent)
      const load = getComponent(entity, AssetLoadedComponent)
      if (asset == undefined || load == undefined) continue
      const node = nodeMap().get(entity)
      if (node === undefined) continue
      load.roots.forEach((root) => {
        reparentEntityNode(root, node)
        reparentObject3D(root, node)
      })
      asset.loaded = LoadState.LOADED
    }

    for (const entity of assetQuery.exit()) {
      const node = nodeMap().get(entity)
      if (node) {
        const children = new Array()
        iterateEntityNode(node, (child, idx) => {
          if (child === node) return
          children.push(child)
        })
        children.forEach((child) => {
          removeEntityNodeFromParent(child)
          removeEntity(child.entity)
        })
      }
      const asset = getComponent(entity, AssetComponent)
      if (asset) asset.loaded = LoadState.UNLOADED
    }
  }
}
