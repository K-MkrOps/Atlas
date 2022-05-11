import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { UserDataType } from '../user/user/user.class'
import { Application } from './../../declarations.d'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { id, method, data, params, app } = context
    const loggedInUser = params.user as UserDataType
    if (method === 'remove' || method === 'patch') {
      const match = await app.service('message').Model.findOne({
        where: {
          id: id,
          senderId: loggedInUser.id
        }
      })

      if (match == null) {
        throw new BadRequest('Message not owned by requesting user')
      }
    }
    return context
  }
}
