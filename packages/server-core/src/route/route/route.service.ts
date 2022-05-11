import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { ActiveRoutesInterface, InstalledRoutesInterface } from '@atlas/common/src/interfaces/Route'
import { ProjectConfigInterface } from '@atlas/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { Route } from './route.class'
import routeDocs from './route.docs'
import hooks from './route.hooks'
import createModel from './route.model'

declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    route: Route
  }

  interface ServiceTypes {
    'route-activate': {
      create: ReturnType<typeof activateRoute>
    }
  }

  interface ServiceTypes {
    'routes-installed': {
      find: ReturnType<typeof getInstalledRoutes>
    }
  }
}

export const getInstalledRoutes = (): any => {
  return async () => {
    const projects = fs
      .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const data: InstalledRoutesInterface[] = []
    await Promise.all(
      projects.map(async (project) => {
        try {
          if (fs.existsSync(path.resolve(__dirname, `../../../../projects/projects/${project}/atlas.config.ts`))) {
            const projectConfig: ProjectConfigInterface = (
              await import(`@atlas/projects/projects/${project}/atlas.config.ts`)
            ).default
            data.push({
              routes: Object.keys(projectConfig.routes!),
              project
            })
          }
        } catch (e) {
          logger.error(e, `[getProjects]: Failed to read config for project "${project}" with error: ${e.message}`)
          return
        }
      })
    )
    return { data }
  }
}

export const activateRoute = (routeService: Route): any => {
  return async (data: { project: string; route: string; activate: boolean }, params: Params) => {
    const activatedRoutes = (await routeService.find(null!)).data as ActiveRoutesInterface[]
    const installedRoutes = (await getInstalledRoutes()()).data
    if (data.activate) {
      const routeToActivate = installedRoutes.find((r) => r.project === data.project && r.routes.includes(data.route))
      if (routeToActivate) {
        // if any projects already have this route, deactivate them
        for (const route of activatedRoutes) {
          if (route.route === data.route) await routeService.remove(route.id)
        }
        await routeService.create({
          route: data.route,
          project: data.project
        })
        return true
      }
    } else {
      const routeToDeactivate = activatedRoutes.find((r) => r.project === data.project && r.route === data.route)
      if (routeToDeactivate) {
        await routeService.remove(routeToDeactivate.id)
        return true
      }
    }
    return false
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Route(options, app)
  event.docs = routeDocs
  app.use('route', event)
  // @ts-ignore
  app.use('routes-installed', {
    find: getInstalledRoutes()
  })
  // @ts-ignore
  app.use('route-activate', {
    create: activateRoute(event)
  })

  const service = app.service('route')

  service.hooks(hooks)
}
