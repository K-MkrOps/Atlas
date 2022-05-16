import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'

import { LoadingCircle } from '@atlasfoundation/client-core/src/components/LoadingCircle'
import { createNetworkTransports } from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientTransport'
import { createEngine, initializeBrowser } from '@atlasfoundation/engine/src/initializeEngine'

import './env-config'
import './hookstate_devtools.es'
import { initialize } from './util'

const AppPage = React.lazy(() => import('./pages/_app'))

const canvasStyle = {
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'fixed',
  WebkitUserSelect: 'none',
  pointerEvents: 'auto',
  userSelect: 'none'
} as React.CSSProperties
const engineRendererCanvasId = 'engine-renderer-canvas'

const Main = () => {
  useEffect(() => {
    createEngine()
    initializeBrowser()
    createNetworkTransports()
  }, [])

  return (
    <Suspense fallback={<LoadingCircle />}>
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
      <AppPage />
    </Suspense>
  )
}

initialize()
  // then load the app
  .then((_) => {
    ReactDOM.render(
      <Suspense fallback={<LoadingCircle />}>
        <AppPage />
      </Suspense>,
      document.getElementById('root')
    )
  })
