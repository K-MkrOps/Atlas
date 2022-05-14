import { iff, isProvider } from 'feathers-hooks-common'

import restrictUserRole from '@atlasfoundation/server-core/src/hooks/restrict-user-role'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    create: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [iff(isProvider('external'), restrictUserRole('admin') as any)]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
