import { Matrix4, Vector3 } from 'three'

import { store } from '@atlasfoundation/client-core/src/store'
import { EntityTreeNode } from '@atlasfoundation/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@atlasfoundation/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@atlasfoundation/engine/src/transform/components/TransformComponent'

import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export interface RotateAroundCommandParams extends CommandParams {
  axis: Vector3

  angle: number

  pivot: Vector3
}

export default class RotateAroundCommand extends Command {
  pivot: Vector3

  axis: Vector3

  angle: number

  constructor(objects: EntityTreeNode[], params: RotateAroundCommandParams) {
    super(objects, params)

    this.pivot = params.pivot.clone()
    this.axis = params.axis.clone()
    this.angle = params.angle
  }

  execute() {
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, this.angle)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: RotateAroundCommand) {
    return (
      this.pivot.equals(newCommand.pivot) &&
      this.axis.equals(newCommand.axis) &&
      arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
    )
  }

  update(command) {
    this.angle += command.angle
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, command.angle)
    this.emitAfterExecuteEvent()
  }

  undo() {
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, this.angle * -1)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `RotateAroundMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}
    pivot: ${serializeVector3(this.pivot)} axis: { ${serializeVector3(this.axis)} angle: ${this.angle} }`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedObject(this.affectedObjects, 'matrix'))
    }
  }

  rotateAround(objects: EntityTreeNode[], pivot: Vector3, axis: Vector3, angle: number): void {
    const pivotToOriginMatrix = new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z)
    const originToPivotMatrix = new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
    const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle)

    for (let i = 0; i < objects.length; i++) {
      const obj3d = getComponent(objects[i].entity, Object3DComponent).value
      const transform = getComponent(objects[i].entity, TransformComponent)

      new Matrix4()
        .copy(obj3d.matrixWorld)
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(obj3d.parent!.matrixWorld.clone().invert())
        .decompose(transform.position, transform.rotation, transform.scale)
    }
  }
}
