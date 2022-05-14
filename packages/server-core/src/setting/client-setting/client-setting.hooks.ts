import { iff, isProvider } from 'feathers-hooks-common'

import restrictUserRole from '@atlasfoundation/server-core/src/hooks/restrict-user-role'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)]
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
