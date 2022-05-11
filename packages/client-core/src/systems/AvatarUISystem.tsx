import { UserId } from '@atlas/common/src/interfaces/UserId'
import { AvatarComponent } from '@atlas/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@atlas/engine/src/ecs/classes/Engine'
import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import { World } from '@atlas/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@atlas/engine/src/ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '@atlas/engine/src/networking/components/NetworkObjectComponent'
import { NetworkActionReceptor } from '@atlas/engine/src/networking/functions/NetworkActionReceptor'
import { TransformComponent } from '@atlas/engine/src/transform/components/TransformComponent'
import { XRUIComponent } from '@atlas/engine/src/xrui/components/XRUIComponent'
import { addActionReceptor } from '@atlas/hyperflux'

import { createAvatarDetailView } from './ui/AvatarDetailView'
import { createAvatarContextMenuView } from './ui/UserMenuView'

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()

export const renderAvatarContextMenu = (world: World, userId: UserId, contextMenuEntity: Entity) => {
  const userEntity = world.getUserAvatarEntity(userId)
  if (!userEntity) return

  const contextMenuXRUI = getComponent(contextMenuEntity, XRUIComponent)
  if (!contextMenuXRUI) return

  const userTransform = getComponent(userEntity, TransformComponent)
  const { avatarHeight } = getComponent(userEntity, AvatarComponent)

  contextMenuXRUI.container.scale.setScalar(
    Math.max(1, Engine.instance.camera.position.distanceTo(userTransform.position) / 3)
  )
  contextMenuXRUI.container.position.copy(userTransform.position)
  contextMenuXRUI.container.position.y += avatarHeight - 0.3
  contextMenuXRUI.container.position.x += 0.1
  contextMenuXRUI.container.position.z +=
    contextMenuXRUI.container.position.z > Engine.instance.camera.position.z ? -0.4 : 0.4
  contextMenuXRUI.container.rotation.setFromRotationMatrix(Engine.instance.camera.matrix)
}

export default async function AvatarUISystem(world: World) {
  const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent])
  const AvatarContextMenuUI = createAvatarContextMenuView()
  return () => {
    for (const userEntity of userQuery.enter()) {
      if (userEntity === world.localClientEntity) continue
      if (AvatarUI.has(userEntity)) {
        console.log('entity already exists: ' + userEntity)
        continue
      }
      const userId = getComponent(userEntity, NetworkObjectComponent).ownerId
      const ui = createAvatarDetailView(userId)
      AvatarUI.set(userEntity, ui)
    }

    for (const userEntity of userQuery()) {
      if (userEntity === world.localClientEntity) continue
      const ui = AvatarUI.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const xrui = getComponent(ui.entity, XRUIComponent)
      if (!xrui) continue
      xrui.container.scale.setScalar(
        Math.max(1, Engine.instance.camera.position.distanceTo(userTransform.position) / 3)
      )
      xrui.container.position.copy(userTransform.position)
      xrui.container.position.y += avatarHeight + 0.3
      xrui.container.rotation.setFromRotationMatrix(Engine.instance.camera.matrix)
    }

    for (const userEntity of userQuery.exit()) {
      if (userEntity === world.localClientEntity) continue

      const entity = AvatarUI.get(userEntity)?.entity
      if (typeof entity !== 'undefined') removeEntity(entity)
      AvatarUI.delete(userEntity)
    }

    if (AvatarContextMenuUI.state.id.value !== '') {
      renderAvatarContextMenu(world, AvatarContextMenuUI.state.id.value, AvatarContextMenuUI.entity)
    }
  }
}
