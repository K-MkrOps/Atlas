import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'

import ErrorBoundary from '@atlasfoundation/client-core/src/common/components/ErrorBoundary'
import { LoadingCircle } from '@atlasfoundation/client-core/src/components/LoadingCircle'
import { ClientTransportHandler } from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientTransport'
import { AuthService } from '@atlasfoundation/client-core/src/user/services/AuthService'
import { createEngine, initializeBrowser } from '@atlasfoundation/engine/src/initializeEngine'
import { Network } from '@atlasfoundation/engine/src/networking/classes/Network'

import { CustomRoute, getCustomRoutes } from './getCustomRoutes'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

const $admin = React.lazy(() => import('@atlasfoundation/client-core/src/admin/adminRoutes'))
const $auth = React.lazy(() => import('@atlasfoundation/client/src/pages/auth/authRoutes'))
const $offline = React.lazy(() => import('@atlasfoundation/client/src/pages/offline/offline'))
const $503 = React.lazy(() => import('../pages/503'))
const $404 = React.lazy(() => import('../pages/404'))

function RouterComp(props) {
  const [customRoutes, setCustomRoutes] = useState(null as any as CustomRoute[])

  useEffect(() => {
    AuthService.doLoginAuto()
    createEngine()
    Network.instance.transportHandler = new ClientTransportHandler()
    initializeBrowser()
    getCustomRoutes().then((routes) => {
      setCustomRoutes(routes)
    })
  }, [])

  if (!customRoutes) {
    return <LoadingCircle />
  }

  return (
    <ErrorBoundary>
      <React.Fragment>
        <Suspense fallback={<LoadingCircle />}>
          <Switch>
            {customRoutes.map((route, i) => (
              <Route key={`custom-route-${i}`} path={route.route} component={route.component} {...route.props} />
            ))}
            <Route key={'offline'} path={'/offline'} component={$offline} />
            {/* default to allowing admin access regardless */}
            <Route key={'default-admin'} path={'/admin'} component={$admin} />
            <Route key={'default-auth'} path={'/auth'} component={$auth} />
            {/* if no index page has been provided, indicate this as obviously as possible */}
            <Route key={'/503'} path={'/'} component={$503} exact />
            <Route key={'404'} path="*" component={$404} />
          </Switch>
        </Suspense>
      </React.Fragment>
    </ErrorBoundary>
  )
}

export default RouterComp
