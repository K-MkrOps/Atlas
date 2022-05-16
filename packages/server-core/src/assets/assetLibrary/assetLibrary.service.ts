import { Application } from '../../../declarations'
import { AssetLibrary } from './assetLibrary.class'
import hooks from './assetLibrary.hooks'

declare module '@atlasfoundation/common/declarations' {
  interface ServiceTypes {
    'asset-library': AssetLibrary
  }
}

export default (app: Application) => {
  const libClass = new AssetLibrary(app)
  app.use('asset-library', libClass)
  const service = app.service('asset-library')
  service.hooks(hooks)
}
