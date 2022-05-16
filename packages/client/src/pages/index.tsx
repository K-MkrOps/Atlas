import React, { Fragment, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Trans, useTranslation } from 'react-i18next'
import { Redirect } from 'react-router-dom'

import {
  ClientSettingService,
  useClientSettingState
} from '@atlasfoundation/client-core/src/admin/services/Setting/ClientSettingService'
import ProfileMenu from '@atlasfoundation/client-core/src/user/components/UserMenu/menus/ProfileMenu'

const ROOT_REDIRECT: any = globalThis.process.env['VITE_ROOT_REDIRECT']

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []

  useEffect(() => {
    !clientSetting && ClientSettingService.fetchClientSettings()
  }, [])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Redirect to={ROOT_REDIRECT} />
    else window.location.href = ROOT_REDIRECT
  } else
    return (
      <div className="lander">
        <style>
          {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
        </style>
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        <div className="main-background">
        </div>
        <div className="main-section">
          <div className="form-container">
            <style>
              {`
                [class*=menuPanel] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    transform: none;
                    margin: 40px 0px;
                    pointer-events: auto;
                }
              `}
            </style>
            <ProfileMenu />
          </div>
        </div>
      </div>
    )
}

export default HomePage
