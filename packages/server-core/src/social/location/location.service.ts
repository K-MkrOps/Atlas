import { Application } from '../../../declarations'
import { Location } from './location.class'
import locationDocs from './location.docs'
import hooks from './location.hooks'
import createModel from './location.model'

declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    location: Location
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
  const event = new Location(options, app)
  event.docs = locationDocs

  app.use('location', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('location')

  service.hooks(hooks)
}
