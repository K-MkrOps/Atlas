import { Entity } from '@atlasfoundation/engine/src/ecs/classes/Entity'
import { addComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@atlasfoundation/engine/src/ecs/functions/EntityFunctions'
import TransformGizmo from '@atlasfoundation/engine/src/scene/classes/TransformGizmo'
import { Object3DComponent } from '@atlasfoundation/engine/src/scene/components/Object3DComponent'
import { TransformGizmoComponent } from '@atlasfoundation/engine/src/scene/components/TransformGizmo'

export const createGizmoEntity = (gizmo: TransformGizmo): Entity => {
  const entity = createEntity()
  addComponent(entity, Object3DComponent, { value: gizmo })
  addComponent(entity, TransformGizmoComponent, {})

  return entity
}
