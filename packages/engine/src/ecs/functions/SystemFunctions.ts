/** Functions to provide system level functionalities. */
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { World } from '../classes/World'
import { SystemUpdateType } from '../functions/SystemUpdateType'

export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<() => void>
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }
export type SystemModulePromise<A extends any> = Promise<SystemModule<A>>

export type SystemModuleType<A> = {
  systemModulePromise: SystemModulePromise<A>
  type: SystemUpdateType
  sceneSystem?: boolean
  args?: A
}

export type SystemFactoryType<A> = {
  systemModule: SystemModule<A>
  type: SystemUpdateType
  sceneSystem?: boolean
  args?: A
}

export type SystemInstanceType = {
  name: string
  type: SystemUpdateType
  sceneSystem: boolean
  execute: () => void
}

export const initSystems = async (world: World, systemModulesToLoad: SystemModuleType<any>[]) => {
  const loadSystemInjection = async (s: SystemFactoryType<any>) => {
    const name = s.systemModule.default.name
    try {
      const system = await s.systemModule.default(world, s.args)
      return {
        name,
        type: s.type,
        sceneSystem: s.sceneSystem,
        execute: () => {
          const start = nowMilliseconds()
          try {
            system()
          } catch (e) {
            console.error(e)
          }
          const end = nowMilliseconds()
          const duration = end - start
          if (duration > 10) {
            console.warn(`Long system execution detected. System: ${name} \n Duration: ${duration}`)
          }
        }
      } as SystemInstanceType
    } catch (e) {
      console.error(`System ${name} failed to initialize! `)
      console.error(e)
      return null
    }
  }
  const systemModule = await Promise.all(
    systemModulesToLoad.map(async (s) => {
      return {
        args: s.args,
        type: s.type,
        sceneSystem: s.sceneSystem,
        systemModule: await s.systemModulePromise
      }
    })
  )
  const systems = await Promise.all(systemModule.map(loadSystemInjection))
  systems.forEach((s) => {
    if (s) {
      world.pipelines[s.type].push(s)
      console.log(`${s.type} ${s.name}`)
    }
  })
}

export const unloadSystems = (world: World, sceneSystemsOnly = false) => {
  Object.entries(world.pipelines).forEach(([type, pipeline]) => {
    const systemsToRemove: any[] = []
    pipeline.forEach((s) => {
      if (sceneSystemsOnly) {
        if (s.sceneSystem) systemsToRemove.push(s)
      } else {
        systemsToRemove.push(s)
      }
    })
    systemsToRemove.forEach((s) => {
      const i = pipeline.indexOf(s)
      pipeline.splice(i, 1)
    })
  })
}
