import { Application } from '../../../declarations'
import { MatchUser } from './match-user.class'
import matchUserDocs from './match-user.docs'
import hooks from './match-user.hooks'
import createModel from './match-user.model'

declare module '@atlasfoundation/common/declarations' {
  interface ServiceTypes {
    'match-user': MatchUser
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   *
   */

  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  const matchUserService = new MatchUser(options, app)
  matchUserService.docs = matchUserDocs

  app.use('match-user', matchUserService)

  const service = app.service('match-user')

  service.hooks(hooks)
}
