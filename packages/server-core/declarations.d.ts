// src/declarations.d.ts
import type { Application as ExpressFeathers } from '@feathersjs/express'
import type * as x from '@feathersjs/feathers'
import '@feathersjs/transport-commons'
import * as k8s from '@kubernetes/client-node'
import type SocketIO from 'socket.io'

import { ServiceTypes } from '@atlasfoundation/common/declarations'

import { SocketWebRTCServerTransport } from '../gameserver/src/SocketWebRTCServerTransport'

export type Application = ExpressFeathers<ServiceTypes> & {
  // Common
  k8AgonesClient: k8s.CustomObjectsApi
  k8DefaultClient: k8s.CoreV1Api
  k8AppsClient: k8s.AppsV1Api
  k8BatchClient: k8s.BatchV1Api
  agonesSDK: any
  sync: any
  io: SocketIO.Server
  transport: SocketWebRTCServerTransport
  seed: () => Application // function

  // Gameserver
  instance: any
  gsSubdomainNumber: string
  isChannelInstance: boolean
  gameServer: any
  isSetup: Promise<boolean>
  restart: () => void

  // API Server
}
