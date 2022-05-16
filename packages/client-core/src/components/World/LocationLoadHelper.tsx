import { useHistory } from 'react-router-dom'
import matches from 'ts-matches'

import { AppAction, GeneralStateList } from '@atlasfoundation/client-core/src/common/services/AppService'
import { accessProjectState } from '@atlasfoundation/client-core/src/common/services/ProjectService'
import { MediaStreamService } from '@atlasfoundation/client-core/src/media/services/MediaStreamService'
import { LocationService } from '@atlasfoundation/client-core/src/social/services/LocationService'
import { useDispatch } from '@atlasfoundation/client-core/src/store'
import { getPortalDetails } from '@atlasfoundation/client-core/src/world/functions/getPortalDetails'
import { initSystems } from '@atlasfoundation/engine/src/ecs/functions/SystemFunctions'
import {
  initializeCoreSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@atlasfoundation/engine/src/initializeEngine'
import { NetworkWorldAction } from '@atlasfoundation/engine/src/networking/functions/NetworkWorldAction'
import { updateNearbyAvatars } from '@atlasfoundation/engine/src/networking/systems/MediaStreamSystem'
import { EngineRenderer } from '@atlasfoundation/engine/src/renderer/WebGLRendererSystem'
import { loadSceneFromJSON } from '@atlasfoundation/engine/src/scene/functions/SceneLoading'
import { addActionReceptor } from '@atlasfoundation/hyperflux'
import { loadEngineInjection } from '@atlasfoundation/projects/loadEngineInjection'
import { getSystemsFromSceneData } from '@atlasfoundation/projects/loadSystemInjection'

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

export const initClient = async () => {
  const projects = accessProjectState().projects.value.map((project) => project.name)
  const world = Engine.instance.currentWorld

  await initializeCoreSystems(),
    await initializeRealtimeSystems(),
    await initializeSceneSystems(),
    await loadEngineInjection(world, projects)

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

export const loadScene = (sceneData: SceneData) => {
  const dispatch = useDispatch()
  dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADING))
  const sceneSystems = getSystemsFromSceneData(sceneData.project, sceneData.scene, true)
  loadSceneFromJSON(sceneData.scene, sceneSystems).then(() => {
    getPortalDetails()
    dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
  })
}