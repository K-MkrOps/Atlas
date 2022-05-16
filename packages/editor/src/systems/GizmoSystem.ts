import { Engine } from '@atlasfoundation/engine/src/ecs/classes/Engine'
import { World } from '@atlasfoundation/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import TransformGizmo from '@atlasfoundation/engine/src/scene/classes/TransformGizmo'
import { Object3DComponent } from '@atlasfoundation/engine/src/scene/components/Object3DComponent'
import { TransformGizmoComponent } from '@atlasfoundation/engine/src/scene/components/TransformGizmo'

const GIZMO_SIZE = 10

/**
 */
export default async function GizmoSystem(_: World) {
  const gizmoQuery = defineQuery([TransformGizmoComponent])

  return () => {
    for (const entity of gizmoQuery()) {
      const gizmoObj = getComponent(entity, Object3DComponent)?.value as TransformGizmo
      if (!gizmoObj || !gizmoObj.visible) return

      const eyeDistance = gizmoObj.position.distanceTo(Engine.instance.currentWorld.camera.position) / GIZMO_SIZE
      gizmoObj.scale.set(eyeDistance, eyeDistance, eyeDistance)
    }
  }
}
