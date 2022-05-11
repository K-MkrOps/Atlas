import path from 'path'

import { ProjectEventHooks } from '@atlas/projects/ProjectConfigInterface'
import { Application } from '@atlas/server-core/declarations'
import { installAvatarsFromProject } from '@atlas/server-core/src/user/avatar/avatar-helper'

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
