import assert from 'assert'
import { Color, Fog, Scene } from 'three'

import { ComponentJson } from '@atlasfoundation/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { FogComponent } from '../../components/FogComponent'
import { FogType } from '../../constants/FogType'
import { deserializeFog } from './FogFunctions'

describe('FogFunctions', () => {
  it('deserializeFog', () => {
    createEngine()

    const entity = createEntity()

    const sceneComponentData = {
      type: FogType.Linear,
      color: 'grey',
      density: 2,
      near: 0.1,
      far: 1000
    }
    const sceneComponent: ComponentJson = {
      name: 'fog',
      props: sceneComponentData
    }

    deserializeFog(entity, sceneComponent)

    assert(hasComponent(entity, FogComponent))
    const { type, color, density, near, far } = getComponent(entity, FogComponent)
    assert.equal(type, FogType.Linear)
    assert.deepEqual(color, new Color('grey'))
    assert.equal(density, 2)
    assert.equal(near, 0.1)
    assert.equal(far, 1000)

    assert(Engine.instance.currentWorld.scene.fog instanceof Fog)

    // TODO: unnecessary once engine global scope is refactored
    Engine.instance.currentWorld.scene = null!
  })
})
