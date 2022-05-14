import { Application } from '../../../declarations'
import { Analytics } from './analytics.class'
import hooks from './analytics.hooks'
import createModel from './analytics.model'

declare module '@atlasfoundation/common/declarations' {
  interface ServiceTypes {
    'analytics-setting': Analytics
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Analytics(options, app)
  app.use('analytics-setting', event)
  const service = app.service('analytics-setting')
  service.hooks(hooks)
}
