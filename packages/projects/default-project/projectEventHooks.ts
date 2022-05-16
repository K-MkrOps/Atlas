import path from 'path'

import { ProjectEventHooks } from '@atlasfoundation/projects/ProjectConfigInterface'
import { Application } from '@atlasfoundation/server-core/declarations'
import { installAvatarsFromProject } from '@atlasfoundation/server-core/src/user/avatar/avatar-helper'

const avatarsFolder = path.resolve(__dirname, 'public/avatars')

const config = {
  onInstall: (app: Application) => {
    return installAvatarsFromProject(app, avatarsFolder)
  }
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
