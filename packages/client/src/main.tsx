import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'

import { LoadingCircle } from '@atlas/client-core/src/components/LoadingCircle'

import './env-config'
import './hookstate_devtools.es'
import { initialize } from './util'

const AppPage = React.lazy(() => import('./pages/_app'))

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
