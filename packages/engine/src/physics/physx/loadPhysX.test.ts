import assert from 'assert'

import { loadPhysX } from './loadPhysX'

describe('loadPhysX', () => {
  after(() => {
    delete (globalThis as any).PhysX
  })

  let originalPhysX
  it('should load physx', async () => {
    await loadPhysX()
    originalPhysX = PhysX
    assert(PhysX)
    assert((globalThis as any).PhysX)

    // something random to test that the wasm did in fact load properly
    const tolerance = new PhysX.PxTolerancesScale()
    assert(tolerance)
    assert.deepStrictEqual(tolerance.length, 1)
  })

  it('should properly unbind physx from global scope', async () => {
    assert(PhysX)
    assert.equal((globalThis as any).PhysX, PhysX)
    delete (globalThis as any).PhysX
    assert.equal((globalThis as any).PhysX, undefined)
  })

  it('should load physx a second time', async () => {
    await loadPhysX()
    assert(PhysX)
    assert((globalThis as any).PhysX)
    assert.notEqual(originalPhysX, PhysX)
    assert.notDeepEqual(originalPhysX, PhysX)
    assert.notDeepStrictEqual(originalPhysX, PhysX)

    const tolerance = new PhysX.PxTolerancesScale()
    assert.deepStrictEqual(tolerance.length, 1)
  })
})
