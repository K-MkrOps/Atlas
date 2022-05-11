import React, { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'

import {
  ClientSettingService,
  useClientSettingState
} from '@atlas/client-core/src/admin/services/Setting/ClientSettingService'
import { initGA, logPageView } from '@atlas/client-core/src/common/components/analytics'
import { ProjectService, useProjectState } from '@atlas/client-core/src/common/services/ProjectService'
import { useDispatch } from '@atlas/client-core/src/store'
import { theme } from '@atlas/client-core/src/theme'
import { useAuthState } from '@atlas/client-core/src/user/services/AuthService'
import GlobalStyle from '@atlas/client-core/src/util/GlobalStyle'
import { StoredLocalAction } from '@atlas/client-core/src/util/StoredLocalState'
import { loadWebappInjection } from '@atlas/projects/loadWebappInjection'

import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles'

import RouterComp from '../route/public'
import './styles.scss'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const App = (): any => {
  const selfUser = useAuthState().user
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const [ctitle, setTitle] = useState<string>(clientSetting?.title || '')
  const [favicon16, setFavicon16] = useState(clientSetting?.favicon16px)
  const [favicon32, setFavicon32] = useState(clientSetting?.favicon32px)
  const [description, setDescription] = useState(clientSetting?.siteDescription)
  const [clientThemeSettings, setClientThemeSettings] = useState(clientSetting?.themeSettings)
  const dispatch = useDispatch()
  const [projectComponents, setProjectComponents] = useState<Array<any>>(null!)
  const [fetchedProjectComponents, setFetchedProjectComponents] = useState(false)
  const projectState = useProjectState()

  const initApp = useCallback(() => {
    if (process.env && process.env.NODE_CONFIG) {
      ;(window as any).env = process.env.NODE_CONFIG
    } else {
      ;(window as any).env = (window as any).env ?? ''
    }

    dispatch(StoredLocalAction.restoreLocalData())

    initGA()

    logPageView()
  }, [])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      const currentTheme = selfUser?.user_setting?.value?.themeMode || 'dark'
      html.dataset.theme = currentTheme

      if (clientThemeSettings) {
        if (currentTheme === 'light' && clientThemeSettings?.light) {
          for (let variable of Object.keys(clientThemeSettings.light)) {
            ;(document.querySelector(`[data-theme=light]`) as any)?.style.setProperty(
              '--' + variable,
              clientThemeSettings.light[variable]
            )
          }
        } else if (currentTheme === 'dark' && clientThemeSettings?.dark) {
          for (let variable of Object.keys(clientThemeSettings.dark)) {
            ;(document.querySelector(`[data-theme=dark]`) as any)?.style.setProperty(
              '--' + variable,
              clientThemeSettings.dark[variable]
            )
          }
        }
      }
    }
  }, [selfUser?.user_setting?.value])

  useEffect(initApp, [])

  useEffect(() => {
    ProjectService.fetchProjects()
    !clientSetting && ClientSettingService.fetchClientSettings()
  }, [])

  useEffect(() => {
    if (projectState.projects.value.length > 0 && !fetchedProjectComponents) {
      setFetchedProjectComponents(true)
      loadWebappInjection(
        {},
        projectState.projects.value.map((project) => project.name)
      ).then((result) => {
        setProjectComponents(result)
      })
    }
  }, [projectState.projects.value])

  useEffect(() => {
    if (clientSetting) {
      setTitle(clientSetting?.title)
      setFavicon16(clientSetting?.favicon16px)
      setFavicon32(clientSetting?.favicon32px)
      setDescription(clientSetting?.siteDescription)
      setClientThemeSettings(clientSetting?.themeSettings)
    }
    ClientSettingService.fetchClientSettings()
  }, [clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    const currentTheme = selfUser?.user_setting?.value?.themeMode || 'dark'

    if (clientThemeSettings) {
      if (currentTheme === 'light' && clientThemeSettings?.light) {
        for (let variable of Object.keys(clientThemeSettings.light)) {
          ;(document.querySelector(`[data-theme=light]`) as any)?.style.setProperty(
            '--' + variable,
            clientThemeSettings.light[variable]
          )
        }
      } else if (currentTheme === 'dark' && clientThemeSettings?.dark) {
        for (let variable of Object.keys(clientThemeSettings.dark)) {
          ;(document.querySelector(`[data-theme=dark]`) as any)?.style.setProperty(
            '--' + variable,
            clientThemeSettings.dark[variable]
          )
        }
      }
    }
  }, [clientThemeSettings])

  return (
    <>
      <Helmet>
        <title>{ctitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no"
        />
        {description && <meta name="description" content={description}></meta>}
        {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
        {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
      </Helmet>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <RouterComp />
          {projectComponents}
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

const AppPage = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default AppPage
