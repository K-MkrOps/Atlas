import { Application } from '../../../declarations'
import { GitHubAppService } from './githubapp.class'
import hooks from './githubapp.hooks'

declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    'github-app': GitHubAppService
  }
}

export default (app: Application): any => {
  const githubAppService = new GitHubAppService({}, app)
  app.use('github-app', githubAppService)

  const service = app.service('github-app')

  service.hooks(hooks)
}
