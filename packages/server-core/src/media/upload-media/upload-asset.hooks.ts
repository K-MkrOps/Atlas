import { disallow } from 'feathers-hooks-common'

import addUriToFile from '@atlasfoundation/server-core/src/hooks/add-uri-to-file'
import logRequest from '@atlasfoundation/server-core/src/hooks/log-request'
import attachOwnerIdInSavingContact from '@atlasfoundation/server-core/src/hooks/set-loggedin-user-in-body'

import authenticate from '../../hooks/authenticate'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [authenticate(), attachOwnerIdInSavingContact('userId'), addUriToFile()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
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
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
