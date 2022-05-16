// Initializes the `gameserver-subdomain-provision` service on path `/gameserver-subdomain-provision`
import { Application } from '../../../declarations'
import { GameserverSubdomainProvision } from './gameserver-subdomain-provision.class'
import gameServerSubdomainProvisionDocs from './gameServer-subdomain-provision.docs'
import hooks from './gameserver-subdomain-provision.hooks'
import createModel from './gameserver-subdomain-provision.model'

// Add this service to the service type index
declare module '@atlasfoundation/common/declarations' {
  interface ServiceTypes {
    'gameserver-subdomain-provision': GameserverSubdomainProvision
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
  const event = new GameserverSubdomainProvision(options, app)
  event.docs = gameServerSubdomainProvisionDocs
  app.use('gameserver-subdomain-provision', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('gameserver-subdomain-provision')

  service.hooks(hooks)
}
