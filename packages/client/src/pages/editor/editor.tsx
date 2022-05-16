import React, { Suspense } from 'react'

import FormDialog from '@atlasfoundation/client-core/src/admin/common/SubmitDialog'
import { userHasAccessHook } from '@atlasfoundation/client-core/src/user/userHasAccess'
import ProjectEditor from '@atlasfoundation/editor/src/pages/editor'

import CircularProgress from '@mui/material/CircularProgress'

const EditorProtectedRoutes = () => {
  const isSceneAllowed = userHasAccessHook('editor:write')

  return (
    <Suspense
      fallback={
        <div
          style={{
            height: '100vh',
            width: '100%',
            textAlign: 'center',
            paddingTop: 'calc(50vh - 7px)'
          }}
        >
          <CircularProgress />
        </div>
      }
    >
      {isSceneAllowed ? <ProjectEditor /> : <FormDialog />}
    </Suspense>
  )
}

export default EditorProtectedRoutes
