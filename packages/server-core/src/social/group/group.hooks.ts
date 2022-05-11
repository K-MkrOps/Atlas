import { HookContext } from '@feathersjs/feathers'

import createGroupOwner from '@atlas/server-core/src/hooks/create-group-owner'
import groupPermissionAuthenticate from '@atlas/server-core/src/hooks/group-permission-authenticate'
import removeGroupUsers from '@atlas/server-core/src/hooks/remove-group-users'

import authenticate from '../../hooks/authenticate'
import logger from '../../logger'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [],
    update: [groupPermissionAuthenticate()],
    patch: [
      groupPermissionAuthenticate(),
      async (context: HookContext): Promise<HookContext> => {
        const foundItem = await (context.app.service('scope') as any).Model.findAll({
          where: {
            groupId: context.arguments[0]
          }
        })
        if (!foundItem.length) {
          context.arguments[1]?.scopeTypes?.forEach(async (el) => {
            await context.app.service('scope').create({
              type: el.type,
              groupId: context.arguments[0]
            })
          })
        } else {
          foundItem.forEach(async (scp) => {
            await context.app.service('scope').remove(scp.dataValues.id)
          })
          context.arguments[1]?.scopeTypes?.forEach(async (el) => {
            await context.app.service('scope').create({
              type: el.type,
              groupId: context.arguments[0]
            })
          })
        }
        return context
      }
    ],
    remove: [groupPermissionAuthenticate(), removeGroupUsers()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      createGroupOwner(),
      async (context: HookContext): Promise<HookContext> => {
        try {
          context.arguments[0]?.scopeTypes?.forEach(async (el) => {
            await context.app.service('scope').create({
              type: el.type,
              groupId: context.result.id
            })
          })
          return context
        } catch (err) {
          logger.error(err, `GROUP AFTER CREATE ERROR: ${err.error}`)
          return null!
        }
      }
    ],
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
