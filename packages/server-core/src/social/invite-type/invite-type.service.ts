// Initializes the `invite-type` service on path `/invite-type`
import { Application } from '../../../declarations'
import { InviteType } from './invite-type.class'
import inviteTypeDocs from './invite-type.docs'
import hooks from './invite-type.hooks'
import createModel from './invite-type.model'

// Add this service to the service type index
declare module '@atlasfoundation/common/declarations' {
  interface ServiceTypes {
    'invite-type': InviteType
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   */

  const event = new InviteType(options, app)
  event.docs = inviteTypeDocs
  app.use('invite-type', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('invite-type')

  service.hooks(hooks)
}
