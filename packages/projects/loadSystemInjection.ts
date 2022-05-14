import type { SceneJson } from '@atlasfoundation/common/src/interfaces/SceneInterface'
import type { SystemModuleType } from '@atlasfoundation/engine/src/ecs/functions/SystemFunctions'
import type { SystemComponentType } from '@atlasfoundation/engine/src/scene/components/SystemComponent'

export const getSystemsFromSceneData = (
  project: string,
  sceneData: SceneJson,
  isClient: boolean
): SystemModuleType<any>[] => {
  const systems: SystemModuleType<any>[] = []
  for (const entity of Object.values(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        const data: SystemComponentType = component.props
        if ((isClient && data.enableClient) || (!isClient && data.enableServer)) {
          systems.push(importSystem(project, data))
        }
      }
    }
  }
  return systems
}

export const importSystem = (project: string, data: SystemComponentType): SystemModuleType<any> => {
  console.info(`Loading system ${data.filePath} from project ${project}. Data`, data)
  const { filePath, systemUpdateType, args } = data
  const filePathRelative = new URL(filePath).pathname.replace(`/projects/${project}/`, '')
  const entryPointSplit = filePathRelative.split('.')
  const entryPointExtension = entryPointSplit.pop()
  // const entryPointFileName = entryPointSplit.join('.')
  // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
  // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
  try {
    switch (entryPointExtension) {
      case 'js':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.js`),
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      case 'jsx':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.jsx`),
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      case 'ts':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.ts`),
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      case 'tsx':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.tsx`),
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      default:
        console.error(`[ProjectLoader]: Failed to load project. File type '${entryPointExtension} 'not supported.`)
        break
    }
  } catch (e) {
    console.log('[ProjectLoader]: Failed to load project entry point:', filePath, e)
  }
  return null!
}
