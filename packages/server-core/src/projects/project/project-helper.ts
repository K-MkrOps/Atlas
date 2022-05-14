import appRootPath from 'app-root-path'
import path from 'path'

import { ProjectConfigInterface, ProjectEventHooks } from '@atlasfoundation/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../logger'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'

export const retriggerBuilderService = async (app: Application) => {
  try {
    // invalidate cache for all installed projects
    await useStorageProvider().createInvalidation(['projects*'])
  } catch (e) {
    logger.error(e, `[Project Rebuild]: Failed to invalidate cache with error: ${e.message}`)
  }

  // trigger k8s to re-run the builder service
  if (app.k8AppsClient) {
    try {
      logger.info('Attempting to reload k8s clients!')
      const restartClientsResponse = await app.k8AppsClient.patchNamespacedDeployment(
        `${config.server.releaseName}-builder-atlas-builder`,
        'default',
        {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
              }
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            'Content-Type': 'application/strategic-merge-patch+json'
          }
        }
      )
      logger.info(restartClientsResponse, 'restartClientsResponse')
      return restartClientsResponse
    } catch (e) {
      logger.error(e)
      return e
    }
  }
}

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

export const onProjectEvent = async (
  app: Application,
  projectName: string,
  hookPath: string,
  eventType: keyof ProjectEventHooks
) => {
  const hooks = require(path.resolve(projectsRootFolder, projectName, hookPath)).default
  if (typeof hooks[eventType] === 'function') await hooks[eventType](app)
}

export const getProjectConfig = async (projectName: string): Promise<ProjectConfigInterface> => {
  try {
    return (await import(`@atlasfoundation/projects/projects/${projectName}/atlas.config.ts`)).default
  } catch (e) {
    logger.error(
      e,
      '[Projects]: WARNING project with ' +
        `name ${projectName} has no atlas.config.ts file - this is not recommended.`
    )
    return null!
  }
}
