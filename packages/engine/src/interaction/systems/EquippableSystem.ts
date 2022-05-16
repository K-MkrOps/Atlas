import matches from 'ts-matches'

import { addActionReceptor } from '@atlasfoundation/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkObjectAuthorityTag } from '../../networking/components/NetworkObjectAuthorityTag'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { teleportRigidbody } from '../../physics/functions/teleportRigidbody'
import { BodyType } from '../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { getParity } from '../functions/equippableFunctions'

function equippableActionReceptor(action) {
  const world = useWorld()

  matches(action).when(NetworkWorldAction.setEquippedObject.matches, (a) => {
    if (a.$from === Engine.instance.userId) return
    const equipper = world.getUserAvatarEntity(a.$from)
    const equipped = world.getNetworkObject(a.object.ownerId, a.object.networkId)
    const attachmentPoint = a.attachmentPoint
    if (!equipped) {
      return console.warn(`Equipped entity with id ${equipped} does not exist! You should probably reconnect...`)
    }
    if (a.equip) {
      if (!hasComponent(equipper, EquipperComponent) && !hasComponent(equipped, EquippedComponent)) {
        addComponent(equipper, EquipperComponent, { equippedEntity: equipped, data: {} as any })
        addComponent(equipped, EquippedComponent, { equipperEntity: equipper, attachmentPoint: attachmentPoint })
      }
    } else {
      const equipperComponent = getComponent(equipper, EquipperComponent)
      if (!equipperComponent) return

      removeComponent(equipper, EquipperComponent)
    }
  })
}

export function equippableQueryEnter(entity) {
  const equipperComponent = getComponent(entity, EquipperComponent)
  if (equipperComponent) {
    const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
    const collider = getComponent(equippedEntity, ColliderComponent)
    if (collider) {
      let phsyxRigidbody = collider.body as PhysX.PxRigidBody
      useWorld().physics.changeRigidbodyType(phsyxRigidbody, BodyType.KINEMATIC)
    }
  }
}

export function equippableQueryExit(entity) {
  const equipperComponent = getComponent(entity, EquipperComponent, true)
  const equippedEntity = equipperComponent.equippedEntity

  const equippedTransform = getComponent(equippedEntity, TransformComponent)
  const collider = getComponent(equippedEntity, ColliderComponent)
  if (collider) {
    let phsyxRigidbody = collider.body as PhysX.PxRigidBody
    useWorld().physics.changeRigidbodyType(phsyxRigidbody, BodyType.DYNAMIC)
    teleportRigidbody(collider.body, equippedTransform.position, equippedTransform.rotation)
  }

  removeComponent(equippedEntity, EquippedComponent)
}

export default async function EquippableSystem(world: World) {
  addActionReceptor(world.store, equippableActionReceptor)

  const equippableQuery = defineQuery([EquipperComponent])

  return () => {
    for (const entity of equippableQuery.enter()) {
      equippableQueryEnter(entity)
    }

    for (const entity of equippableQuery()) {
      // since equippables are all client authoritative, we don't need to recompute this for all users
      if (entity !== world.localClientEntity) continue
      const equipperComponent = getComponent(entity, EquipperComponent)
      const equippedEntity = equipperComponent.equippedEntity
      if (equippedEntity) {
        const isOwnedByMe = getComponent(equippedEntity, NetworkObjectAuthorityTag)
        if (isOwnedByMe) {
          const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
          const attachmentPoint = equippedComponent.attachmentPoint
          const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
          const handTransform = getHandTransform(entity, getParity(attachmentPoint))
          const { position, rotation } = handTransform

          const collider = getComponent(equippedEntity, ColliderComponent)
          if (collider) {
            teleportRigidbody(collider.body, position, rotation)
          }

          equippableTransform.position.copy(position)
          equippableTransform.rotation.copy(rotation)
        }
      }
    }

    for (const entity of equippableQuery.exit()) {
      equippableQueryExit(entity)
    }
  }
}
