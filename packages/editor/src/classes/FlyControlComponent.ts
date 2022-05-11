import { createMappedComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'

export type FlyControlComponentType = {
  moveSpeed: number
  boostSpeed: number
  lookSensitivity: number
  maxXRotation: number
}

export const FlyControlComponent = createMappedComponent<FlyControlComponentType>('FlyControlComponent')
