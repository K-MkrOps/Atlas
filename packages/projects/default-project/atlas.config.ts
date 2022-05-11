import type { ProjectConfigInterface } from '@atlas/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/atlas_thumbnail.jpg',
  routes: {
    '/': {
      component: () => import('@atlas/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/admin': {
      component: () => import('@atlas/client-core/src/admin/adminRoutes')
    },
    '/location': {
      component: () => import('@atlas/client/src/pages/location/location')
    },
    '/auth': {
      component: () => import('@atlas/client/src/pages/auth/authRoutes')
    },
    '/editor': {
      component: () => import('@atlas/client/src/pages/editor/editor')
    }
  },
  services: undefined,
  databaseSeed: undefined
}

export default config
