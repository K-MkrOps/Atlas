import { StaticResourceInterface } from '@atlas/common/src/dbmodels/StaticResource'

import { Application } from '../../../declarations'
import { StaticResource } from './static-resource.class'
import staticResourceDocs from './static-resource.docs'
import hooks from './static-resource.hooks'
import createModel from './static-resource.model'

declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    'static-resource': StaticResource
  }
  interface Models {
    static_resource: ReturnType<typeof createModel> & StaticResourceInterface
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
  const event = new StaticResource(options, app)
  event.docs = staticResourceDocs

  app.use('static-resource', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('static-resource')

  service.hooks(hooks)
}
