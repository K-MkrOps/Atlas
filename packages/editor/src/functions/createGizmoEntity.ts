import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import { addComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@atlas/engine/src/ecs/functions/EntityFunctions'
import TransformGizmo from '@atlas/engine/src/scene/classes/TransformGizmo'
import { Object3DComponent } from '@atlas/engine/src/scene/components/Object3DComponent'
import { TransformGizmoComponent } from '@atlas/engine/src/scene/components/TransformGizmo'

export const createGizmoEntity = (gizmo: TransformGizmo): Entity => {
  const entity = createEntity()
  addComponent(entity, Object3DComponent, { value: gizmo })
  addComponent(entity, TransformGizmoComponent, {})

  return entity
}
