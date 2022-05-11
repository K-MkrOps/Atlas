import { useHistory } from 'react-router-dom'
import { Quaternion, Vector3 } from 'three'
import matches from 'ts-matches'

import { AppAction, GeneralStateList } from '@atlas/client-core/src/common/services/AppService'
import { accessProjectState } from '@atlas/client-core/src/common/services/ProjectService'
import { MediaStreamService } from '@atlas/client-core/src/media/services/MediaStreamService'
import { LocationService } from '@atlas/client-core/src/social/services/LocationService'
import { useDispatch } from '@atlas/client-core/src/store'
import { ClientTransportHandler } from '@atlas/client-core/src/transports/SocketWebRTCClientTransport'
import { AuthState } from '@atlas/client-core/src/user/services/AuthService'
import { getPortalDetails } from '@atlas/client-core/src/world/functions/getPortalDetails'
import { SceneData, SceneJson } from '@atlas/common/src/interfaces/SceneInterface'
import { UserId } from '@atlas/common/src/interfaces/UserId'
import { Engine } from '@atlas/engine/src/ecs/classes/Engine'
import { initSystems, SystemModuleType } from '@atlas/engine/src/ecs/functions/SystemFunctions'
import {
  initializeCoreSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@atlas/engine/src/initializeEngine'
import { Network } from '@atlas/engine/src/networking/classes/Network'
import { NetworkWorldAction } from '@atlas/engine/src/networking/functions/NetworkWorldAction'
import { updateNearbyAvatars } from '@atlas/engine/src/networking/systems/MediaStreamSystem'
import { loadSceneFromJSON } from '@atlas/engine/src/scene/functions/SceneLoading'
import { addActionReceptor, dispatchAction } from '@atlas/hyperflux'
import { loadEngineInjection } from '@atlas/projects/loadEngineInjection'
import { getSystemsFromSceneData } from '@atlas/projects/loadSystemInjection'

export const retrieveLocationByName = (locationName: string) => {
  if (locationName === globalThis.process.env['VITE_LOBBY_LOCATION_NAME']) {
    const history = useHistory()
    LocationService.getLobby()
      .then((lobby) => {
        history.replace('/location/' + lobby?.slugifiedName)
      })
      .catch((err) => console.log('getLobby error', err))
  } else {
    LocationService.getLocationByName(locationName)
  }
}

const getFirstSpawnPointFromSceneData = (scene: SceneJson) => {
  for (const entity of Object.values(scene.entities)) {
    if (entity.name != 'spawn point') continue

    for (const component of entity.components) {
      if (component.name === 'transform') {
        return component.props.position
      }
    }
  }

  console.warn('Could not find spawn point from scene data')
  return { x: 0, y: 0, z: 0 }
}

const createOfflineUser = (sceneData: SceneJson) => {
  const avatarDetail = {
    thumbnailURL: '',
    avatarURL: ''
  }

  const spawnPos = getFirstSpawnPointFromSceneData(sceneData)

  const userId = 'user' as UserId
  const parameters = {
    position: new Vector3().copy(spawnPos),
    rotation: new Quaternion()
  }

  const world = Engine.instance.currentWorld
  world.hostId = userId as any

  // it is needed by AvatarSpawnSystem
  Engine.instance.userId = userId
  // Replicate the server behavior
  dispatchAction(world.store, NetworkWorldAction.createClient({ name: 'user', index: 0 }))
  dispatchAction(world.store, NetworkWorldAction.spawnAvatar({ parameters }))
  dispatchAction(world.store, NetworkWorldAction.avatarDetails({ avatarDetail }))
}

const injectedSystems: SystemModuleType<any>[] = [
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('@atlas/client-core/src/systems/XRUILoadingSystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('@atlas/client-core/src/systems/AvatarUISystem')
  }
]

export const initEngine = async () => {
  await initializeCoreSystems(injectedSystems)
}

export const initClient = async (sceneData: SceneData) => {
  const systems = getSystemsFromSceneData(sceneData.project, sceneData.scene, true)
  const projects = accessProjectState().projects.value.map((project) => project.name)
  const world = Engine.instance.currentWorld

  await Promise.all([
    initializeRealtimeSystems(),
    initializeSceneSystems(),
    initSystems(world, systems),
    loadEngineInjection(world, projects)
  ])

  // add extraneous receptors
  addActionReceptor(world.store, (action) => {
    matches(action)
      .when(NetworkWorldAction.createClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
      .when(NetworkWorldAction.destroyClient.matches, () => {
        updateNearbyAvatars()
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
  })
}

export const loadLocation = (sceneData: SceneJson) => {
  const dispatch = useDispatch()
  // 4. Start scene loading
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))
  loadSceneFromJSON(sceneData).then(() => {
    getPortalDetails()
    dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  })
}
