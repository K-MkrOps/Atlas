// Initializes the `rtc-ports` service on path `/rtc-ports`
import { Application } from '../../../declarations'
import { RtcPorts } from './rtc-ports.class'
import rtcPortsDocs from './rtc-ports.docs'
import hooks from './rtc-ports.hooks'
import createModel from './rtc-ports.model'

// Add this service to the service type index
declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    'rtc-ports': RtcPorts
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   */
  const event = new RtcPorts(options, app)
  event.docs = rtcPortsDocs
  app.use('rtc-ports', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('rtc-ports')

  service.hooks(hooks)
}
