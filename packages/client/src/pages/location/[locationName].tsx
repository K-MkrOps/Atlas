import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useRouteMatch } from 'react-router-dom'

import Layout from '@atlas/client-core/src/components/Layout'
import { LoadingCircle } from '@atlas/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@atlas/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@atlas/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@atlas/client-core/src/components/World/NetworkInstanceProvisioning'
import OfflineLocation from '@atlas/client-core/src/components/World/OfflineLocation'
import { LocationAction, useLocationState } from '@atlas/client-core/src/social/services/LocationService'
import { useDispatch } from '@atlas/client-core/src/store'
import { AuthService } from '@atlas/client-core/src/user/services/AuthService'
import { SceneService } from '@atlas/client-core/src/world/services/SceneService'
import { useEngineState } from '@atlas/engine/src/ecs/classes/EngineService'
import { useHookEffect } from '@atlas/hyperflux'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const { search } = useLocation()
  const dispatch = useDispatch()
  const engineState = useEngineState()
  const locationState = useLocationState()
  const offline = new URLSearchParams(search).get('offline') === 'true'

  const params = match.params as any
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`

  useEffect(() => {
    dispatch(LocationAction.setLocationName(locationName))
    AuthService.listenForUserPatch()
  }, [])

  /**
   * Once we have the location, fetch the current scene data
   */
  useHookEffect(() => {
    if (locationState.currentLocation.location.sceneId.value) {
      const [project, scene] = locationState.currentLocation.location.sceneId.value.split('/')
      SceneService.fetchCurrentScene(project, scene)
    }
  }, [locationState.currentLocation.location.sceneId])

  return (
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      {offline ? <OfflineLocation /> : <NetworkInstanceProvisioning />}
      <LoadLocationScene />
    </Layout>
  )
}

export default LocationPage
