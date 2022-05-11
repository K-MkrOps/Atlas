import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'

import logger from '../logger'
import { UserDataType } from '../user/user/user.class'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    try {
      let fetchedPartyId
      const { id, data, method, params, app, path } = context
      const loggedInUser = params.user as UserDataType
      if (path === 'party-user' && method === 'remove') {
        const partyUser = await app.service('party-user').get(id!)
        fetchedPartyId = partyUser.partyId
      }
      const partyId =
        path === 'party-user' && method === 'find'
          ? params.query?.partyId
          : path === 'party-user' && method === 'create'
          ? data?.partyId
          : fetchedPartyId != null
          ? fetchedPartyId
          : id
      if (method !== 'patch' && method !== 'create') {
        if (params.query == null) params.query = {}
        params.query.partyId = partyId
      }
      const userId = path === 'party' ? loggedInUser?.id : params.query?.userId || loggedInUser?.id || partyId
      const paramsCopy = _.cloneDeep(params)
      if (!paramsCopy.query) paramsCopy.query = {}
      const partyResult = await app.service('party').find(paramsCopy)
      const party = partyResult.data[0]
      if ((path === 'party-user' || path === 'party') && method === 'create' && party.locationId != null) {
        const user = await app.service('user').get(userId)
        const isAdmin = user.location_admins.find((locationAdmin) => locationAdmin.locationId === party.locationId)
        if (isAdmin != null) {
          data.isOwner = 1
        }
        await app.service('user').patch(loggedInUser.id!, {
          partyId: data.partyId
        })
      } else {
        if (params.skipAuth !== true) {
          const partyUserCountResult = await app.service('party-user').find({
            query: {
              partyId: partyId,
              $limit: 0
            }
          })
          if (partyUserCountResult.total > 0) {
            const partyUserResult = await app.service('party-user').find({
              query: {
                partyId: partyId,
                userId: userId
              }
            })
            if (partyUserResult.total === 0) {
              throw new BadRequest('Invalid party ID')
            }
            const partyUser = partyUserResult.data[0]
            if (
              params.partyUsersRemoved !== true &&
              partyUser.isOwner !== true &&
              partyUser.isOwner !== 1 &&
              partyUser.userId !== loggedInUser.id
            ) {
              throw new Forbidden('You must be the owner of this party to perform that action')
            }
          }
        }
      }

      return context
    } catch (err) {
      logger.error('party-permission-authenticate error:', err)
      return null!
    }
  }
}
