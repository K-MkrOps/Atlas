import fs from 'fs'
import path from 'path'

import { ServicesSeedConfig } from '@atlasfoundation/common/src/interfaces/ServicesSeedConfig'
import { ProjectConfigInterface } from '@atlasfoundation/projects/ProjectConfigInterface'

import { analyticsSeeds } from './analytics/seeder-config'
import { mediaSeeds } from './media/seeder-config'
import { networkingSeeds } from './networking/seeder-config'
import { routeSeeds } from './route/seeder-config'
import { scopeSeeds } from './scope/seeder-config'
import { settingSeeds } from './setting/seeder-config'
import { socialSeeds } from './social/seeder-config'
import { userSeeds } from './user/seeder-config'

const installedProjects = fs.existsSync(path.resolve(__dirname, '../../projects/projects'))
  ? fs
      .readdirSync(path.resolve(__dirname, '../../projects/projects'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        try {
          const config: ProjectConfigInterface =
            require(`../../projects/projects/${dirent.name}/atlas.config.ts`).default
          if (!config.databaseSeed) return null
          return path.join(dirent.name, config.databaseSeed)
        } catch (e) {
          // console.log(e)
        }
      })
      .filter((hasServices) => !!hasServices)
      .map((seedDir) => require(`../../projects/projects/${seedDir}`).default)
      .flat()
  : []

export const seeds: Array<ServicesSeedConfig> = [
  ...mediaSeeds,
  ...networkingSeeds,
  ...socialSeeds,
  ...userSeeds,
  ...scopeSeeds,
  ...settingSeeds,
  ...analyticsSeeds,
  ...routeSeeds,
  ...installedProjects
]

export default seeds
