import { Vector3 } from 'three'

import { EntityTreeNode } from '@atlas/engine/src/ecs/classes/EntityTree'
import { createMappedComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'

export type EditorCameraComponentType = {
  center: Vector3
  zoomDelta: number
  focusedObjects: EntityTreeNode[]
  isPanning: boolean
  cursorDeltaX: number
  cursorDeltaY: number
  isOrbiting: boolean
  refocus?: boolean
}

export const EditorCameraComponent = createMappedComponent<EditorCameraComponentType>('TransformGizmo')
