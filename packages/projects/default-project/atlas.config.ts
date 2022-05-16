import type { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/xrengine_thumbnail.jpg',
  routes: {
    '/': {
      component: () => import('@xrengine/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/admin': {
      component: () => import('@xrengine/client-core/src/admin/adminRoutes')
    },
    '/location': {
      component: () => import('@xrengine/client/src/pages/location/location')
    },
    '/auth': {
      component: () => import('@xrengine/client/src/pages/auth/authRoutes')
    },
    '/editor': {
      component: () => import('@xrengine/client/src/pages/editor/editor')
    }
  },
  services: undefined,
  databaseSeed: undefined
}

export default config
