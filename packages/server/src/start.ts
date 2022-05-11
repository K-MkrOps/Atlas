import fs from 'fs'
import https from 'https'
import path from 'path'
import psList from 'ps-list'
import favicon from 'serve-favicon'

import config from '@atlas/server-core/src/appconfig'
import { createFeathersExpressApp } from '@atlas/server-core/src/createApp'
import { StartCorsServer } from '@atlas/server-core/src/createCorsServer'
import logger from '@atlas/server-core/src/logger'

import channels from './channels'

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})

export const start = async (): Promise<void> => {
  const app = createFeathersExpressApp()

  app.use(favicon(path.join(config.server.publicDir, 'favicon.ico')))
  app.configure(channels)

  if (!config.kubernetes.enabled && !config.db.forceRefresh) {
    app.isSetup.then(() => {
      app.service('project')._fetchDevLocalProjects()
    })
  }

  const key = process.platform === 'win32' ? 'name' : 'cmd'
  if (!config.kubernetes.enabled) {
    const processList = await (
      await psList()
    ).filter((e) => {
      const regexp = /docker-compose up|docker-proxy|mysql/gi
      return e[key]?.match(regexp)
    })
    const dockerProcess = processList.find((c) => c[key]?.match(/docker-compose/))
    const dockerProxy = processList.find((c) => c[key]?.match(/docker-proxy/))
    const processMysql = processList.find((c) => c[key]?.match(/mysql/))
    const databaseService = (dockerProcess && dockerProxy) || processMysql

    if (!databaseService) {
      // Check for child process with mac OSX
      // exec("docker ps | grep mariadb", (err, stdout, stderr) => {
      //   if(!stdout.includes("mariadb")){
      //     throw new Error('\x1b[33mError: DB proccess is not running or Docker is not running!. If you are in local development, please run atlas/scripts/start-db.sh and restart server\x1b[0m');
      //   }
      // });
    }
  }

  // SSL setup
  const certPath = config.server.certPath
  const certKeyPath = config.server.keyPath

  const useSSL = !config.noSSL && (config.localBuild || !config.kubernetes.enabled) && fs.existsSync(certKeyPath)

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  }

  if (useSSL) console.log('Starting server with HTTPS')
  else console.log("Starting server with NO HTTPS, if you meant to use HTTPS try 'sudo bash generate-certs'")
  const port = config.server.port

  // http redirects for development
  if (useSSL) {
    app.use((req, res, next) => {
      if (req.secure) {
        // request was via https, so do no special handling
        next()
      } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url)
      }
    })
  }

  const server = useSSL ? https.createServer(certOptions as any, app as any).listen(port) : await app.listen(port)

  if (useSSL === true) app.setup(server)

  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))
  server.on('listening', () =>
    logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
  )

  if (!config.kubernetes.enabled) StartCorsServer(useSSL, certOptions)
}
