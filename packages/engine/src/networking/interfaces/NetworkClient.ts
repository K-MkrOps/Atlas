import type SocketIO from 'socket.io'

import { NetworkId } from '@atlasfoundation/common/src/interfaces/NetworkId'
import { UserId } from '@atlasfoundation/common/src/interfaces/UserId'

import type { AvatarProps } from './WorldState'

export interface NetworkClient {
  userId: UserId
  index: number
  name: string
  subscribedChatUpdates?: string[]
  // The following properties are only present on the server
  socket?: SocketIO.Socket
  socketId?: string
  lastSeenTs?: any
  joinTs?: any
  media?: {}
  consumerLayers?: {}
  stats?: {}
  instanceSendTransport?: any
  instanceRecvTransport?: any
  channelSendTransport?: any
  channelRecvTransport?: any
  dataConsumers?: Map<string, any> // Key => id of data producer
  dataProducers?: Map<string, any> // Key => label of data channel}
  avatarDetail?: AvatarProps
  networkId?: NetworkId // to easily retrieve the network object correspending to this client
}
