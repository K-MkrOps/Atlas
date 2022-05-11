import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { Helmet } from 'react-helmet'
import { useLocation } from 'react-router-dom'

import {
  ClientSettingService,
  useClientSettingState
} from '@atlas/client-core/src/admin/services/Setting/ClientSettingService'
import { Alerts } from '@atlas/client-core/src/common/components/Alerts'
import UIDialog from '@atlas/client-core/src/common/components/Dialog'
import UserToast from '@atlas/client-core/src/common/components/Toast/UserToast'
import { theme as defaultTheme } from '@atlas/client-core/src/theme'
import UserMenu from '@atlas/client-core/src/user/components/UserMenu'
import { useAuthState } from '@atlas/client-core/src/user/services/AuthService'
import { respawnAvatar } from '@atlas/engine/src/avatar/functions/respawnAvatar'
import { isTouchAvailable } from '@atlas/engine/src/common/functions/DetectFeatures'
import { useWorld } from '@atlas/engine/src/ecs/functions/SystemHooks'

import { FullscreenExit, Refresh, ZoomOutMap } from '@mui/icons-material'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp'
import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles'

import { useLoadingSystemState } from '../../systems/state/LoadingState'
import Debug from '../Debug'
import InstanceChat from '../InstanceChat'
import Me from '../Me'
import MediaIconsBox from '../MediaIconsBox'
import PartyVideoWindows from '../PartyVideoWindows'
import styles from './index.module.scss'

const TouchGamepad = React.lazy(() => import('@atlas/client-core/src/common/components/TouchGamepad'))

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

interface Props {
  useLoadingScreenOpacity?: boolean
  login?: boolean
  pageTitle: string
  children?: JSX.Element | JSX.Element[]
  hideVideo?: boolean
  hideFullscreen?: boolean
  theme?: any
}

const Layout = (props: Props): any => {
  const path = useLocation().pathname
  const { pageTitle, children, login } = props
  const authUser = useAuthState().authUser
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const handle = useFullScreenHandle()
  const [ctitle, setTitle] = useState<string>(clientSetting?.title || '')
  const [favicon16, setFavicon16] = useState(clientSetting?.favicon16px)
  const [favicon32, setFavicon32] = useState(clientSetting?.favicon32px)
  const [description, setDescription] = useState(clientSetting?.siteDescription)
  const [showMediaIcons, setShowMediaIcons] = useState(true)
  const [showBottomIcons, setShowBottomIcons] = useState(true)
  const loadingSystemState = useLoadingSystemState()
  const [showTouchPad, setShowTouchPad] = useState(true)
  useEffect(() => {
    !clientSetting && ClientSettingService.fetchClientSettings()
    const topButtonsState = localStorage.getItem('isTopButtonsShown')
    const bottomButtonsState = localStorage.getItem('isBottomButtonsShown')
    if (!topButtonsState) {
      localStorage.setItem('isTopButtonsShown', 'true')
    } else {
      setShowMediaIcons(JSON.parse(topButtonsState))
    }
    if (!bottomButtonsState) {
      localStorage.setItem('isBottomButtonsShown', 'true')
    } else {
      setShowBottomIcons(JSON.parse(bottomButtonsState))
    }
  }, [])

  useEffect(() => {
    if (clientSetting) {
      setTitle(clientSetting?.title)
      setFavicon16(clientSetting?.favicon16px)
      setFavicon32(clientSetting?.favicon32px)
      setDescription(clientSetting?.siteDescription)
    }
  }, [clientSettingState?.updateNeeded?.value])

  const reportChange = useCallback((state) => {
    if (state) {
      setFullScreenActive(state)
    } else {
      setFullScreenActive(state)
    }
  }, [])

  const iOS = (): boolean => {
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    )
  }

  const respawnCallback = (): void => {
    respawnAvatar(useWorld().localClientEntity)
  }

  const hideOtherMenus = (): void => {
    setShowMediaIcons(false)
    setShowBottomIcons(false)
    setShowTouchPad(false)
  }

  const handleShowMediaIcons = () => {
    setShowMediaIcons(!showMediaIcons)
    const topButtonsState = localStorage.getItem('isTopButtonsShown') || ''
    localStorage.setItem('isTopButtonsShown', JSON.stringify(!JSON.parse(topButtonsState)))
  }

  const handleShowBottomIcons = () => {
    setShowBottomIcons(!showBottomIcons)
    const bottomButtonsState = localStorage.getItem('isBottomButtonsShown') || ''
    localStorage.setItem('isBottomButtonsShown', JSON.stringify(!JSON.parse(bottomButtonsState)))
  }

  const useOpacity = typeof props.useLoadingScreenOpacity !== 'undefined' && props.useLoadingScreenOpacity === true
  const layoutOpacity = useOpacity ? 1 - loadingSystemState.opacity.value : 1
  const MediaIconHider = showMediaIcons ? KeyboardDoubleArrowUpIcon : KeyboardDoubleArrowDownIcon
  const BottomIconHider = showBottomIcons ? KeyboardDoubleArrowDownIcon : KeyboardDoubleArrowUpIcon
  //info about current mode to conditional render menus
  // TODO: Uncomment alerts when we can fix issues
  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FullScreen handle={handle} onChange={reportChange}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={props.theme ?? defaultTheme}>
            <section>
              <Helmet>
                <title>
                  {ctitle} | {pageTitle}
                </title>
                {description && <meta name="description" content={description}></meta>}
                {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
                {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
              </Helmet>

              {children}
              {<UserMenu animate={showBottomIcons ? styles.animateBottom : styles.fadeOutBottom} />}
              <Debug />

              {/** Container for fading most stuff in and out depending on if the location is loaded or not  */}
              <div style={{ opacity: layoutOpacity }}>
                <button
                  type="button"
                  className={`${showMediaIcons ? styles.btn : styles.smBtn} ${
                    showMediaIcons ? styles.rotate : styles.rotateBack
                  } ${styles.showIconMedia} `}
                  onClick={handleShowMediaIcons}
                >
                  <MediaIconHider />
                </button>
                <MediaIconsBox animate={showMediaIcons ? styles.animateTop : styles.fadeOutTop} />
                <header className={showMediaIcons ? styles.animateTop : styles.fadeOutTop}>
                  {!props.hideVideo && (
                    <>
                      <section className={styles.locationUserMenu}>
                        {authUser?.accessToken?.value != null && authUser.accessToken.value.length > 0 && <Me />}
                        <PartyVideoWindows />
                      </section>
                      <UserToast />
                    </>
                  )}
                </header>
                <button
                  type="button"
                  className={`${showBottomIcons ? styles.btn : styles.smBtn} ${
                    showBottomIcons ? styles.rotate : styles.rotateBack
                  } ${styles.showIcon} `}
                  onClick={handleShowBottomIcons}
                >
                  <BottomIconHider />
                </button>
                <UIDialog />
                <Alerts />
                {isTouchAvailable && showTouchPad && (
                  <Suspense fallback={<></>}>
                    {' '}
                    <TouchGamepad layout="default" />{' '}
                  </Suspense>
                )}

                {!iOS() && (
                  <>
                    {props.hideFullscreen ? null : fullScreenActive ? (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.fullScreen} ${
                          showBottomIcons ? styles.animateBottom : styles.fadeOutBottom
                        } `}
                        onClick={handle.exit}
                      >
                        <FullscreenExit />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.fullScreen} ${
                          showBottomIcons ? styles.animateBottom : styles.fadeOutBottom
                        } `}
                        onClick={handle.enter}
                      >
                        <ZoomOutMap />
                      </button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  className={`${styles.btn} ${styles.respawn} ${
                    showBottomIcons ? styles.animateBottom : styles.fadeOutBottom
                  } ${!iOS() ? '' : styles.refreshBtn}`}
                  id="respawn"
                  onClick={respawnCallback}
                >
                  <Refresh />
                </button>
                <InstanceChat
                  animate={styles.animateBottom}
                  hideOtherMenus={hideOtherMenus}
                  setShowTouchPad={setShowTouchPad}
                />
              </div>
            </section>
          </ThemeProvider>
        </StyledEngineProvider>
      </FullScreen>
    </div>
  )
}

export default Layout
