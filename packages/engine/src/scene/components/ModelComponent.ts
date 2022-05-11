import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ModelComponentType = {
  src: string
  textureOverride: string
  matrixAutoUpdate: boolean
  isUsingGPUInstancing: boolean
  isDynamicObject: boolean
  curScr?: string
  parsed?: boolean
}

export const ModelComponent = createMappedComponent<ModelComponentType>('ModelComponent')
