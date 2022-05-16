import AgonesSDK from '@google-cloud/agones-sdk'
import { exec } from 'child_process'
import fs from 'fs'
import https from 'https'
import psList from 'ps-list'

import { pipe } from '@atlasfoundation/common/src/utils/pipe'
import '@atlasfoundation/engine/src/patchEngineNode'
import { Application } from '@atlasfoundation/server-core/declarations'
import config from '@atlasfoundation/server-core/src/appconfig'
import {
  configureK8s,
  configureOpenAPI,
  configureRedis,
  configureSocketIO,
  createFeathersExpressApp
} from '@atlasfoundation/server-core/src/createApp'
import multiLogger from '@atlasfoundation/server-core/src/logger'

import channels from './channels'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'

// import preloadLocation from './preload-location'

/**
 * @param status
 */

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})

const onSocketIO = (app: Application) => {
  app.transport = new SocketWebRTCServerTransport(app)
  app.transport.initialize()
}

export const instanceServerPipe = pipe(
  configureOpenAPI(),
  configureSocketIO(true, onSocketIO),
  configureRedis(),
  configureK8s()
) as (app: Application) => Application

export const start = async (): Promise<Application> => {
  const app = createFeathersExpressApp(instanceServerPipe)

  const agonesSDK = new AgonesSDK()

  agonesSDK.connect()
  agonesSDK.ready().catch((err) => {
    console.log(err)
    throw new Error(
      '\x1b[33mError: Agones is not running!. If you are in local development, please run atlas/scripts/sh start-agones.sh and restart server\x1b[0m'
    )
  })
  app.agonesSDK = agonesSDK
  setInterval(() => agonesSDK.health(), 1000)

  app.configure(channels)

  /**
   * When using local dev, to properly test multiple worlds for portals we
   * need to programatically shut down and restart the gameserver process.
   */
  if (!config.kubernetes.enabled) {
    app.restart = () => {
      require('child_process').spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      process.exit(0)
    }
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
      // // Check for child process with mac OSX
      // exec('docker ps | grep mariadb', (err, stdout, stderr) => {
      //   if (!stdout.includes('mariadb')) {
      //     throw new Error(
      //       '\x1b[33mError: DB proccess is not running or Docker is not running!. If you are in local development, please run atlas/scripts/start-db.sh and restart server\x1b[0m'
      //     )
      //   }
      // })
    }
  }

  // SSL setup
  const certPath = config.server.certPath
  const certKeyPath = config.server.keyPath
  const useSSL = !config.noSSL && (config.localBuild || !config.kubernetes.enabled) && fs.existsSync(certKeyPath)

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  } as any
  const port = config.gameserver.port
  if (useSSL) console.log('Starting gameserver with HTTPS on', port)
  else
    console.log(
      `Starting gameserver with NO HTTPS on ${port}, if you meant to use HTTPS try 'sudo bash generate-certs'`
    )

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

  // const server = useSSL
  //   ? https.createServer(certOptions, app as any).listen(port)
  //   : app.listen(port);

  const server = useSSL ? https.createServer(certOptions, app as any).listen(port) : await app.listen(port)

  if (useSSL === true) app.setup(server)

  // if (config.gameserver.locationName != null) {
  //   console.log('PRELOADING WORLD WITH LOCATION NAME', config.gameserver.locationName)
  //   preloadLocation(config.gameserver.locationName, app)
  // }

  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))
  // if (process.env.APP_ENV === 'production' && fs.existsSync('/var/log')) {
  //   try {
  //     console.log("Writing access log to ", '/var/log/api.access.log');
  //     const access = fs.createWriteStream('/var/log/api.access.log');
  //     process.stdout.write = process.stderr.write = access.write.bind(access);
  //     console.log('Log file write setup successfully');
  //   } catch(err) {
  //     console.log('access log write error');
  //     console.log(err);
  //   }
  // } else {
  //   console.warn("Directory /var/log not found, not writing access log");
  // }
  server.on('listening', () =>
    logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
  )

  return app
}
