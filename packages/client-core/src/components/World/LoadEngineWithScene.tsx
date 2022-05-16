import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'

import { LocationInstanceConnectionAction } from '@atlasfoundation/client-core/src/common/services/LocationInstanceConnectionService'
import { LocationService } from '@atlasfoundation/client-core/src/social/services/LocationService'
import { useDispatch } from '@atlasfoundation/client-core/src/store'
import { leave } from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientFunctions'
import { SceneAction, useSceneState } from '@atlasfoundation/client-core/src/world/services/SceneService'
import { Engine } from '@atlasfoundation/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@atlasfoundation/engine/src/ecs/classes/EngineState'
import { Network } from '@atlasfoundation/engine/src/networking/classes/Network'
import { teleportToScene } from '@atlasfoundation/engine/src/scene/functions/teleportToScene'
import { dispatchAction, useHookEffect } from '@atlasfoundation/hyperflux'

import { AppAction, GeneralStateList } from '../../common/services/AppService'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { initClient, loadScene } from './LocationLoadHelper'

export const LoadEngineWithScene = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const engineState = useEngineState()
  const sceneState = useSceneState()
  const [clientInitialized, setClientInitialized] = useState(false)
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    initEngine()
  }, [])

  /**
   * Once we know what projects we need, initialise the client.
   */
  useHookEffect(() => {
    // We assume that the number of projects will always be greater than 0 as the default project is assumed un-deletable
    if (!clientInitialized && engineState.isEngineInitialized.value && sceneState.currentScene.value) {
      setClientInitialized(true)
      initClient(sceneState.currentScene.value!).then(() => {
        setClientReady(true)
      })
    }
  }, [engineState.isEngineInitialized, sceneState.currentScene])

  /**
   * Once we have the scene data, load the location
   */
  useHookEffect(() => {
    const sceneJSON = sceneState.currentScene.ornull?.scene.value
    if (clientReady && sceneJSON) {
      loadLocation(sceneJSON)
    }
  }, [clientReady, sceneState.currentScene])

  useHookEffect(() => {
    if (engineState.joinedWorld.value) {
      if (engineState.isTeleporting.value) {
        // if we are coming from another scene, reset our teleporting status
        dispatchAction(Engine.instance.store, EngineActions.setTeleporting({ isTeleporting: false }))
      } else {
        dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))
        dispatch(AppAction.setAppLoaded(true))
      }
    }
  }, [engineState.joinedWorld])

  useHookEffect(() => {
    if (engineState.isTeleporting.value) {
      // TODO: this needs to be implemented on the server too
      // Use teleportAvatar function from moveAvatar.ts when required
      // if (slugifiedNameOfCurrentLocation === portalComponent.location) {
      //   teleportAvatar(
      //     useWorld().localClientEntity,
      //     portalComponent.remoteSpawnPosition,
      //     portalComponent.remoteSpawnRotation
      //   )
      //   return
      // }

      console.log('reseting connection for portal teleport')

      const world = useWorld()

      dispatch(SceneAction.currentSceneChanged(null))
      history.push('/location/' + world.activePortal.location)
      LocationService.getLocationByName(world.activePortal.location)

      // shut down connection with existing GS
      leave(Network.instance.getTransport('world') as SocketWebRTCClientTransport)
      dispatch(LocationInstanceConnectionAction.disconnect())

      teleportToScene()
    }
  }, [engineState.isTeleporting])

  return canvas
}
