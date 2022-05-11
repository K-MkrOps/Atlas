import React from 'react'

import { useAuthState } from '@atlas/client-core/src/user/services/AuthService'
import { UserId } from '@atlas/common/src/interfaces/UserId'
import { SpawnPoints } from '@atlas/engine/src/avatar/AvatarSpawnSystem'
import { Engine } from '@atlas/engine/src/ecs/classes/Engine'
import { useEngineState } from '@atlas/engine/src/ecs/classes/EngineService'
import { receiveJoinWorld } from '@atlas/engine/src/networking/functions/receiveJoinWorld'
import { useHookEffect } from '@atlas/hyperflux'

import { client } from '../../feathers'
import GameServerWarnings from './GameServerWarnings'

export const OfflineLocation = () => {
  const engineState = useEngineState()
  const authState = useAuthState()

  /** OFFLINE */
  useHookEffect(async () => {
    if (engineState.sceneLoaded.value) {
      const world = Engine.instance.currentWorld
      const userId = authState.authUser.identityProvider.userId.value
      Engine.instance.userId = userId
      world.hostId = Engine.instance.userId as UserId

      const index = 1
      world.userIdToUserIndex.set(userId, index)
      world.userIndexToUserId.set(index, userId)
      world.clients.set(userId, {
        userId: userId,
        index: index,
        name: authState.user.name.value,
        subscribedChatUpdates: []
      })

      const user = await client.service('user').get(Engine.instance.userId)
      const avatarDetails = await client.service('avatar').get(user.avatarId!)

      const avatarSpawnPose = SpawnPoints.instance.getRandomSpawnPoint()
      receiveJoinWorld({
        elapsedTime: 0,
        clockTime: Date.now(),
        client: {
          index: 1,
          name: authState.user.name.value
        },
        cachedActions: [],
        avatarDetail: {
          avatarURL: avatarDetails.avatarURL,
          thumbnailURL: avatarDetails.thumbnailURL!
        },
        avatarSpawnPose
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  return <GameServerWarnings />
}

export default OfflineLocation
