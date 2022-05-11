import { UserId } from '@atlas/common/src/interfaces/UserId'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

export type NearbyUser = { id: UserId; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

export function getNearbyUsers(userId: UserId, maxMediaUsers = 8): Array<NearbyUser> {
  const userAvatar = Engine.instance.currentWorld.getUserAvatarEntity(userId)
  const otherUsers = [] as UserId[]
  for (const [otherUserId] of Engine.instance.currentWorld.clients) {
    if (userId === otherUserId) continue
    otherUsers.push(otherUserId)
  }
  if (typeof userAvatar === 'number') {
    const userPosition = getComponent(userAvatar, TransformComponent).position
    if (userPosition) {
      const userDistances = [] as Array<{ id: UserId; distance: number }>
      for (const id of otherUsers) {
        const avatar = Engine.instance.currentWorld.getUserAvatarEntity(id)
        if (typeof avatar === 'number') {
          const position = getComponent(avatar, TransformComponent).position
          if (position) {
            userDistances.push({
              id,
              distance: position.distanceTo(userPosition)
            })
          }
        }
      }
      return userDistances.sort(compareDistance).slice(0, maxMediaUsers)
    } else return []
  } else return []
}
