import { Application } from '../../../declarations'
import { StaticResourceType } from './static-resource-type.class'
import staticResourceTypeDocs from './static-resource-type.docs'
import hooks from './static-resource-type.hooks'
import createModel from './static-resource-type.model'

declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    'static-resource-type': StaticResourceType
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
  const event = new StaticResourceType(options, app)
  event.docs = staticResourceTypeDocs
  app.use('static-resource-type', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('static-resource-type')

  service.hooks(hooks)
}
