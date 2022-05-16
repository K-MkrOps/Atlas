import { XRFrame } from 'three'

import type { UserId } from '@atlasfoundation/common/src/interfaces/UserId'
import { createHyperStore } from '@atlasfoundation/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import type { World } from '../classes/World'
import type { SystemModuleType } from '../functions/SystemFunctions'

export class Engine {
  static instance: Engine

  /** The uuid of the logged-in user */
  userId: UserId

  store = createHyperStore({
    name: 'ENGINE',
    getDispatchId: () => 'engine',
    getDispatchTime: () => Engine.instance.elapsedTime
  })

  elapsedTime = 0

  engineTimer: { start: Function; stop: Function; clear: Function } = null!

  isBot = false

  isHMD = false

  /**
   * The current world
   */
  currentWorld: World = null!

  /**
   * All worlds that are currently instantiated
   */
  worlds: World[] = []

  publicPath: string = null!

  simpleMaterials = false
  xrFrame: XRFrame

  isEditor = false
}

globalThis.Engine = Engine
