import { store } from '@atlas/client-core/src/store'
import { SceneJson } from '@atlas/common/src/interfaces/SceneInterface'
import { EntityTreeNode } from '@atlas/engine/src/ecs/classes/EntityTree'
import { createEntity } from '@atlas/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  getEntityNodeArrayFromEntities,
  traverseEntityNode
} from '@atlas/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@atlas/engine/src/ecs/functions/SystemHooks'
import { ScenePrefabTypes } from '@atlas/engine/src/scene/functions/registerPrefabs'
import { reparentObject3D } from '@atlas/engine/src/scene/functions/ReparentFunction'
import { createNewEditorNode, loadSceneEntity } from '@atlas/engine/src/scene/functions/SceneLoading'

import { executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3D } from '../functions/debug'
import { getDetachedObjectsRoots } from '../functions/getDetachedObjectsRoots'
import makeUniqueName from '../functions/makeUniqueName'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export interface AddObjectCommandParams extends CommandParams {
  prefabTypes?: ScenePrefabTypes | ScenePrefabTypes[]

  sceneData?: SceneJson | SceneJson[]

  /** Parent object which will hold objects being added by this command */
  parents?: EntityTreeNode | EntityTreeNode[]

  /** Child object before which all objects will be added */
  befores?: EntityTreeNode | EntityTreeNode[]

  /** Whether to use unique name or not */
  useUniqueName?: boolean
}

export default class AddObjectCommand extends Command {
  parents?: EntityTreeNode[]
  befores?: EntityTreeNode[]
  prefabTypes?: ScenePrefabTypes[]
  sceneData?: SceneJson[]

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  constructor(objects: EntityTreeNode[], params: AddObjectCommandParams) {
    super(objects, params)

    this.parents = params.parents ? (Array.isArray(params.parents) ? params.parents : [params.parents]) : undefined
    this.befores = params.befores ? (Array.isArray(params.befores) ? params.befores : [params.befores]) : undefined
    this.useUniqueName = params.useUniqueName ?? true

    this.sceneData = params.sceneData
      ? Array.isArray(params.sceneData)
        ? params.sceneData
        : [params.sceneData]
      : undefined

    this.prefabTypes = params.prefabTypes
      ? Array.isArray(params.prefabTypes)
        ? params.prefabTypes
        : [params.prefabTypes]
      : undefined

    if (this.keepHistory) {
      this.oldSelection = accessSelectionState().selectedEntities.value.slice(0)
    }
  }

  execute(): void {
    this.emitBeforeExecuteEvent()
    this.addObject(this.affectedObjects, this.prefabTypes, this.sceneData, this.parents, this.befores)
    this.emitAfterExecuteEvent()
  }

  undo(): void {
    executeCommand(EditorCommands.REMOVE_OBJECTS, this.affectedObjects, {
      deselectObject: false,
      skipSerialization: true
    })

    if (this.oldSelection) {
      executeCommand(EditorCommands.REPLACE_SELECTION, getEntityNodeArrayFromEntities(this.oldSelection))
    }
  }

  toString(): string {
    return `AddObjectCommand id: ${this.id} object: ${serializeObject3D(this.affectedObjects)} parent: ${
      this.parents
    } before: ${serializeObject3D(this.befores)}`
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent && this.isSelected) {
      cancelGrabOrPlacement()
      store.dispatch(SelectionAction.changedBeforeSelection())
    }
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      if (this.isSelected) {
        updateOutlinePassSelection()
      }

      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedSceneGraph())
    }
  }

  addObject(
    objects: EntityTreeNode[],
    prefabTypes?: ScenePrefabTypes[],
    sceneData?: SceneJson[],
    parents?: EntityTreeNode[],
    befores?: EntityTreeNode[]
  ): void {
    const rootObjects = getDetachedObjectsRoots(objects) as EntityTreeNode[]
    const world = useWorld()
    console.log(objects, prefabTypes, sceneData)
    for (let i = 0; i < rootObjects.length; i++) {
      const object = rootObjects[i]

      if (prefabTypes) {
        createNewEditorNode(object.entity, prefabTypes[i] ?? prefabTypes[0])
      } else if (sceneData) {
        const data = sceneData[i] ?? sceneData[0]

        traverseEntityNode(object, (node) => {
          node.entity = createEntity()
          loadSceneEntity(node, data.entities[node.uuid])

          if (node.parentEntity && node.uuid !== data.root)
            reparentObject3D(node, node.parentEntity, undefined, world.entityTree)
        })
      }

      let parent = parents ? parents[i] ?? parents[0] : world.entityTree.rootNode
      let before = befores ? befores[i] ?? befores[0] : undefined

      const index = before && parent.children ? parent.children.indexOf(before.entity) : undefined
      addEntityNodeInTree(object, parent, index, false, world.entityTree)

      reparentObject3D(object, parent, before, world.entityTree)

      if (this.useUniqueName) traverseEntityNode(object, (node) => makeUniqueName(node, world))
    }

    if (this.isSelected) {
      executeCommand(EditorCommands.REPLACE_SELECTION, this.affectedObjects, {
        shouldEmitEvent: false
      })
    }
  }
}
