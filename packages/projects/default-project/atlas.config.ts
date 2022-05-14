import type { ProjectConfigInterface } from '@atlasfoundation/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: './public/default.jpeg',
  routes: {
    '/': {
      component: () => import('@atlasfoundation/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/admin': {
      component: () => import('@atlasfoundation/client-core/src/admin/adminRoutes')
    },
    '/location': {
      component: () => import('@atlasfoundation/client/src/pages/location/location')
    },
    '/auth': {
      component: () => import('@atlasfoundation/client/src/pages/auth/authRoutes')
    },
    '/editor': {
      component: () => import('@atlasfoundation/client/src/pages/editor/editor')
    }
  },
  services: undefined,
  databaseSeed: undefined
}

export default config
