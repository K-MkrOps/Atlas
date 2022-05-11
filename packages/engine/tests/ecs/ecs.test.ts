import assert from 'assert'
import * as bitecs from 'bitecs'

import { Engine } from '../../src/ecs/classes/Engine'
import { World } from '../../src/ecs/classes/World'
import {
  addComponent,
  createMappedComponent,
  defineQuery,
  getComponent,
  removeComponent
} from '../../src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../src/ecs/functions/EntityFunctions'
import { initSystems } from '../../src/ecs/functions/SystemFunctions'
import { useWorld } from '../../src/ecs/functions/SystemHooks'
import { SystemUpdateType } from '../../src/ecs/functions/SystemUpdateType'
import { createEngine } from '../../src/initializeEngine'

const mockDelta = 1 / 60

type MockComponentData = {
  mockValue: number
}

const MockComponent = createMappedComponent<MockComponentData>('MockComponent')

const MockSystemModulePromise = async () => {
  return {
    default: MockSystemInitialiser
  }
}

const MockSystemState = new Map<World, Array<number>>()

async function MockSystemInitialiser(world: World, args: {}) {
  const mockQuery = defineQuery([MockComponent])
  MockSystemState.set(world, [])

  return () => {
    const mockState = MockSystemState.get(world)!

    // console.log('run MockSystem')
    for (const entity of mockQuery.enter()) {
      const component = getComponent(entity, MockComponent)
      console.log('Mock query enter', entity, component)
      mockState.push(component.mockValue)
      console.log('externalState', mockState)
    }

    for (const entity of mockQuery.exit()) {
      const component = getComponent(entity, MockComponent, true)
      console.log('Mock query exit', entity, component)
      mockState.splice(mockState.indexOf(component.mockValue))
      console.log('externalState', mockState)
    }
  }
}

describe('ECS', () => {
  beforeEach(async () => {
    createEngine()
    const world = Engine.instance.currentWorld
    await initSystems(world, [
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: MockSystemModulePromise()
      }
    ])
  })

  // afterEach(() => {
  //   // deletEngine.instance.currentWorld
  // })

  it('should create ECS world', () => {
    const world = Engine.instance.currentWorld
    assert(world)
    const entities = world.entityQuery()
    console.log(entities)
    assert.strictEqual(entities.length, 1)
    assert.strictEqual(entities[0], world.worldEntity)
  })

  it('should add systems', async () => {
    const world = useWorld()
    assert.strictEqual(world.pipelines[SystemUpdateType.UPDATE].length, 1)
  })

  it('should add entity', async () => {
    const entity = createEntity()
    const world = useWorld()
    const entities = world.entityQuery()
    assert.strictEqual(entities.length, 2)
    assert.strictEqual(entities[0], world.worldEntity)
    assert.strictEqual(entities[1], entity)
  })

  it('should support enter and exit queries', () => {
    const entity = createEntity()
    const query = defineQuery([MockComponent])

    assert.equal(query().length, 0)
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit().length, 0)

    addComponent(entity, MockComponent, { mockValue: 42 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    assert.ok(!query().includes(entity))
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit()[0], entity)

    addComponent(entity, MockComponent, { mockValue: 43 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    addComponent(entity, MockComponent, { mockValue: 44 })
    assert.ok(query().includes(entity))
    let enter = query.enter()
    let exit = query.exit()
    assert.equal(enter.length, 1)
    assert.equal(enter[0], entity)
    assert.equal(exit.length, 1)
    assert.equal(exit[0], entity)

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong unknown property
    addComponent(entity, MockComponent, { mockValueWrong: 44 })

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong missing required property
    addComponent(entity, MockComponent, {})

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong value type
    addComponent(entity, MockComponent, { mockValue: 'hi' })
  })

  it('should add component', async () => {
    const entity = createEntity()
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, mockValue)
  })

  it('should query component in systems', async () => {
    const world = useWorld()

    const entity = createEntity()
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    world.execute(mockDelta)
    assert.strictEqual(component.mockValue, MockSystemState.get(world)![0])

    const entity2 = createEntity()
    const mockValue2 = Math.random()
    addComponent(entity2, MockComponent, { mockValue: mockValue2 })
    const component2 = getComponent(entity2, MockComponent)
    world.execute(mockDelta)
    assert.strictEqual(component2.mockValue, MockSystemState.get(world)![1])
  })

  it('should remove and clean up component', async () => {
    const world = useWorld()

    const entity = createEntity()
    const mockValue = Math.random()

    addComponent(entity, MockComponent, { mockValue })
    removeComponent(entity, MockComponent)

    const query = defineQuery([MockComponent])
    assert.deepStrictEqual([...query()], [])
    assert.deepStrictEqual(query.enter(), [])
    assert.deepStrictEqual(query.exit(), [])

    world.execute(mockDelta)
    assert.deepStrictEqual(MockSystemState.get(world)!, [])
  })

  it('should re-add component', async () => {
    const world = useWorld()
    const entity = createEntity()
    const state = MockSystemState.get(world)!

    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })

    removeComponent(entity, MockComponent)
    world.execute(mockDelta)
    assert.deepStrictEqual(state, [])

    const newMockValue = 1 + Math.random()
    assert.equal(bitecs.hasComponent(Engine.instance.currentWorld!, MockComponent, entity), false)
    addComponent(entity, MockComponent, { mockValue: newMockValue })
    assert.equal(bitecs.hasComponent(Engine.instance.currentWorld!, MockComponent, entity), true)
    const component = getComponent(entity, MockComponent)
    console.log(component)
    assert(component)
    assert.strictEqual(component.mockValue, newMockValue)
    world.execute(mockDelta)
    world.execute(mockDelta)
    assert.strictEqual(newMockValue, state[0])
  })

  it('should remove and clean up entity', async () => {
    const world = useWorld()

    const entity = createEntity()
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const entities = world.entityQuery()
    assert.deepStrictEqual(entity, entities[1])
    removeEntity(entity)
    assert.ok(!getComponent(entity, MockComponent))
    assert.ok(getComponent(entity, MockComponent, true))
    world.execute(mockDelta)
    assert.deepStrictEqual(MockSystemState.get(world)!, [])
    assert.ok(!world.entityQuery().includes(entity))
  })

  it('should tolerate removal of same entity multiple times', async () => {
    const world = useWorld()
    createEntity()
    createEntity()
    createEntity()
    const entity = createEntity()

    const lengthBefore = world.entityQuery().length
    removeEntity(entity)
    removeEntity(entity)
    removeEntity(entity)
    world.execute(mockDelta)

    const entities = world.entityQuery()
    assert.equal(entities.length, lengthBefore - 1)
    assert.ok(!entities.includes(entity))
  })
})
