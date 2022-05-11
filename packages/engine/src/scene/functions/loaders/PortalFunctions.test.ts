import assert from 'assert'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@atlas/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { PortalComponent } from '../../components/PortalComponent'
import { deserializePortal } from './PortalFunctions'

describe('PortalFunctions', () => {
  it('deserializePortal', async () => {
    createEngine()
    await Engine.instance.currentWorld.physics.createScene({ verbose: true })

    const entity = createEntity()

    const quat = new Quaternion().random()
    const triggerRotation = new Euler().setFromQuaternion(quat, 'XYZ')

    const randomVector3 = new Vector3().random()
    addComponent(entity, TransformComponent, {
      position: randomVector3.clone(),
      rotation: new Quaternion(),
      scale: new Vector3()
    })

    const linkedPortalId = MathUtils.generateUUID()

    const sceneComponentData = {
      location: 'test',
      linkedPortalId,
      triggerPosition: { x: 1, y: 1, z: 1 },
      triggerRotation,
      triggerScale: { x: 1, y: 1, z: 1 },
      spawnPosition: { x: 2, y: 3, z: 4 },
      spawnRotation: { x: 2, y: 3, z: 4, w: 5 }
    }
    const sceneComponent: ComponentJson = {
      name: 'portal',
      props: sceneComponentData
    }

    deserializePortal(entity, sceneComponent)

    assert(hasComponent(entity, PortalComponent))

    // TODO: mesh only created on client
    const portalComponent = getComponent(entity, PortalComponent)
    assert.equal(portalComponent.location, 'test')
    assert.equal(portalComponent.linkedPortalId, linkedPortalId)
    assert(Engine.instance.currentWorld.portalQuery().includes(entity))

    // clean up physx
    delete (globalThis as any).PhysX
  })
})
