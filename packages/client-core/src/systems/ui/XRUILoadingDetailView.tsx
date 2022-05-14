import { createState, State, useHookstate } from '@speigg/hookstate'
import getImagePalette from 'image-palette-core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useEngineState } from '@atlasfoundation/engine/src/ecs/classes/EngineService'
import { createXRUI, XRUI } from '@atlasfoundation/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@atlasfoundation/engine/src/xrui/functions/useXRUIState'

import { useSceneState } from '../../world/services/SceneService'
import ProgressBar from './SimpleProgressBar'

interface LoadingUIState {
  imageWidth: number
  imageHeight: number
}

export async function createLoaderDetailView() {
  let hasSceneColors = false
  const xrui = await new Promise<XRUI<State<LoadingUIState>>>((resolve) => {
    const xrui = createXRUI(function Loading() {
      return (
        <LoadingDetailView
          onStateChange={(state) => {
            hasSceneColors = state.hasSceneColors
          }}
          colorsLoadedCallback={() => resolve(xrui)}
        />
      )
    }, createState({ imageWidth: 1, imageHeight: 1 }))
  })
  const container = await xrui.container
  await container.updateUntilReady()
  return xrui
}

const col = new Color()

function setDefaultPalette(colors) {
  colors.main.set('black')
  colors.background.set('white')
  colors.alternate.set('black')
}

const LoadingDetailView = (props: {
  colorsLoadedCallback
  onStateChange: (state: { hasSceneColors: boolean }) => void
}) => {
  const uiState = useXRUIState<LoadingUIState>()
  const sceneState = useSceneState()
  const engineState = useEngineState()
  const { t } = useTranslation()
  const colors = useHookstate({
    main: '',
    background: '',
    alternate: ''
  })

  useEffect(() => {
    const thumbnailUrl = sceneState.currentScene.ornull?.thumbnailUrl.value
    const img = new Image()

    if (thumbnailUrl) {
      colors.main.set('')
      colors.background.set('')
      colors.alternate.set('')
      img.crossOrigin = 'anonymous'
      img.onload = function () {
        uiState.imageWidth.set(img.naturalWidth)
        uiState.imageHeight.set(img.naturalHeight)
        const palette = getImagePalette(img)
        if (palette) {
          colors.main.set(palette.color)
          colors.background.set(palette.backgroundColor)
          col.set(colors.background.value)
          colors.alternate.set(palette.alternativeColor)
        } else {
          setDefaultPalette(colors)
        }
        props.colorsLoadedCallback()
      }
      img.src = thumbnailUrl
    } else {
      setDefaultPalette(colors)
    }

    return () => {
      img.onload = null
    }
  }, [sceneState.currentScene.ornull?.thumbnailUrl])

  useEffect(() => {
    const hasScene = !!sceneState.currentScene
    const hasThumbnail = !!sceneState.currentScene.ornull?.thumbnailUrl.value
    const hasColors = !!colors.main.value
    props.onStateChange({
      hasSceneColors: (hasScene && hasThumbnail && hasColors) || (hasScene && !hasThumbnail && hasColors)
    })
  }, [colors, sceneState])

  const sceneLoading = engineState.sceneLoading.value
  const sceneLoaded = engineState.sceneLoaded.value
  const joinedWorld = engineState.joinedWorld.value
  const loadingDetails =
    sceneLoading || !sceneLoaded
      ? t('common:loader.loadingObjects')
      : !joinedWorld
      ? t('common:loader.joiningWorld')
      : t('common:loader.loadingComplete')

  return (
    <>
      <style>{`
      #loading-container {
        position: relative;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        font-family: 'Roboto', sans-serif;
      }

      #loading-container img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        filter: blur(5px);
        ${colors.background.value ? 'backgroundColor: ' + colors.background.value : ''};
      }

      #loading-ui {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        padding: 2px;
        text-align: center;
        text-shadow: 1px 1px 6px ${colors.background.value};
        -webkit-text-stroke: 0.25px #${col.getHexString()}aa;
        -webkit-font-smoothing: antialiased;
      }

      #loading-text {
        font-size: 15px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: ${colors.alternate.value};
      }
      
      #progress-text {
        font-size: 25px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: ${colors.main.value};
      }

      #progress-container {
        margin: auto;
        text-align: center;
        padding: 5px;
        width: 100px;
      }
      
      #loading-details {
        font-size: 10px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: ${colors.main.value};
      }
      
    `}</style>
      <div id="loading-container" xr-layer="true">
        {/* <div id="thumbnail">
          <img xr-layer="true" xr-pixel-ratio="1" src={thumbnailUrl} crossOrigin="anonymous" />
        </div> */}
        <div id="loading-ui" xr-layer="true">
          <div id="loading-text" xr-layer="true" xr-pixel-ratio="3">
            {t('common:loader.loading')}
          </div>
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="8">
            {engineState.loadingProgress.value}%
          </div>
          <div id="progress-container" xr-layer="true">
            <ProgressBar
              bgColor={colors.alternate.value}
              completed={engineState.loadingProgress.value}
              height="1px"
              baseBgColor="#000000"
              isLabelVisible={false}
            />
          </div>
          <div id="loading-details" xr-layer="true" xr-pixel-ratio="8">
            {loadingDetails}
          </div>
        </div>
      </div>
    </>
  )
}
