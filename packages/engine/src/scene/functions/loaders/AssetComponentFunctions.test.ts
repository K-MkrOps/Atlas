import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import rewire from 'rewire'
import Sinon from 'sinon'

import { ComponentJson } from '@atlas/common/src/interfaces/SceneInterface'
import { Engine } from '@atlas/engine/src/ecs/classes/Engine'
import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import {
  addComponent,
  getAllComponentsOfType,
  getComponent,
  hasComponent
} from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@atlas/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  removeEntityNodeFromParent
} from '@atlas/engine/src/ecs/functions/EntityTreeFunctions'
import { createEngine, initializeCoreSystems } from '@atlas/engine/src/initializeEngine'
import '@atlas/engine/src/patchEngineNode'
import { AssetComponent, AssetLoadedComponent, LoadState } from '@atlas/engine/src/scene/components/AssetComponent'
import { ModelComponent } from '@atlas/engine/src/scene/components/ModelComponent'
import { gltfToSceneJson, handleScenePaths } from '@atlas/engine/src/scene/functions/GLTFConversion'
import {
  deserializeAsset,
  loadAsset,
  SCENE_COMPONENT_ASSET,
  SCENE_COMPONENT_ASSET_DEFAULT_VALUES,
  serializeAsset,
  unloadAsset
} from '@atlas/engine/src/scene/functions/loaders/AssetComponentFunctions'
import { loadECSData } from '@atlas/engine/src/scene/functions/SceneLoading'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { XRELoader } from '../../../assets/classes/XRELoader'
import { EntityTreeNode } from '../../../ecs/classes/EntityTree'
import { World } from '../../../ecs/classes/World'

describe('AssetComponentFunctions', async () => {
  let entity: Entity
  let node: EntityTreeNode
  let world: World
  let sandbox: Sinon.SinonSandbox
  const initEntity = () => {
    entity = createEntity()
    node = createEntityNode(entity)
    world = Engine.instance.currentWorld

    addEntityNodeInTree(node)
  }
  const testDir = 'packages/engine/tests/assets/'
  beforeEach(async () => {
    sandbox = Sinon.createSandbox()
    createEngine()
    Engine.instance.publicPath = ''
    await initializeCoreSystems()
    initEntity()
  })

  afterEach(() => {
    sandbox.restore()
  })

  function dupeLoader(): any {
    return Object.entries(AssetLoader)
      .map(([k, v]) => {
        const result = {}
        result[k] = v
        return result
      })
      .reduce((a: Object, b: Object) => {
        return { ...a, ...b }
      })
  }

  function setContent(content) {
    const dudLoader = dupeLoader()

    dudLoader.loadAsync = async (url) => {
      return content
    }
    return dudLoader
  }

  function noFile() {
    const dudLoader = dupeLoader()
    dudLoader.loadAsync = async (url) => {
      throw Error('file not found')
    }
    return dudLoader
  }

  async function loadXRE(file) {
    const scenePath = path.join(appRootPath.path, testDir, file)
    const xreLoader = new XRELoader()

    const result = await xreLoader.parse(fs.readFileSync(scenePath, { encoding: 'utf-8' }))
    return result
  }

  describe('loadAsset()', () => {
    it('Correctly handles loading empty asset', async () => {
      //load test empty scene
      addComponent(entity, AssetComponent, {
        path: `${testDir}/empty.xre.gltf`,
        name: 'empty',
        loaded: LoadState.UNLOADED
      })
      //load asset from example repo
      const emptyScene = loadXRE('empty.xre.gltf')
      await loadAsset(entity, setContent(emptyScene))
      //wait one frame for system to reparent
      world.execute(world.fixedDelta)

      //check that AssetLoadedComponent is correctly configured
      const loadedComp = getComponent(entity, AssetLoadedComponent)
      assert(loadedComp, 'loaded asset')
      //check that AssetComponent is correctly configured
      const assetComp = getComponent(entity, AssetComponent)
      assert(assetComp, 'asset component exists')
      assert.equal(assetComp.loaded, LoadState.LOADED, 'asset is in a loaded state')
    })

    it('Correctly handles file not existing', async () => {
      addComponent(entity, AssetComponent, {
        path: `${testDir}/nonexistent.xre.gltf`,
        name: 'nonexistent',
        loaded: LoadState.UNLOADED
      })
      //load from asset path that does not exist
      try {
        await loadAsset(entity, noFile())
        //wait one frame for system to reparent]
        Engine.instance.currentWorld.execute(world.fixedDelta)
      } catch (e) {
        //check that AssetLoadedComponent does not exist
        assert(!hasComponent(entity, AssetLoadedComponent), 'no AssetLoadedComponent')
        //check that AssetComponent has identical state to pre-load attempt
        const assetComp = getComponent(entity, AssetComponent)
        assert(assetComp, 'asset component exists')
        assert(assetComp.loaded === LoadState.UNLOADED, 'asset is in unloaded state')
      }
    })

    it('Correctly handles loading basic test asset file', async () => {
      const assetPath = `${testDir}/empty_model.xre.gltf`
      addComponent(entity, AssetComponent, {
        path: assetPath,
        name: 'empty_model',
        loaded: LoadState.UNLOADED
      })
      //load asset from example repo
      await loadAsset(entity, setContent(loadXRE('empty_model.xre.gltf')))
      //wait one frame for system to reparent
      world.execute(world.fixedDelta)
      //check that AssetLoadedComponent and AssetComponent are correctly configured
      const assetComp = getComponent(entity, AssetComponent)
      const loadedComp = getComponent(entity, AssetLoadedComponent)
      assert(assetComp, 'Asset component exists')
      assert(loadedComp, 'Asset Loaded Component exists')
      //check that asset root contains correct children
      const eNode = world.entityTree.entityNodeMap.get(entity)
      assert(eNode, 'asset root entity node exists')
      const modelChild = eNode.children![0]
      //check for model component
      const modelComp = getComponent(modelChild, ModelComponent)
      assert(modelComp, 'Child model component exists')
    })

    it('Correctly handles multiple load calls in single frame', async () => {
      addComponent(entity, AssetComponent, {
        path: `${testDir}/empty.xre.gltf`,
        name: 'empty',
        loaded: LoadState.UNLOADED
      })
      //repeated load asset call for empty asset
      const loader = setContent(loadXRE('empty.xre.gltf'))
      await Promise.all([loadAsset(entity, loader), loadAsset(entity, loader)]) //one of these should return a warning saying Asset is not unloaded

      //wait one frame for system to reparent
      const world = Engine.instance.currentWorld
      world.execute(world.fixedDelta)
      //check that second call is ignored by...
      //make sure that loaded state is identical to single load call
      const assetComp = getComponent(entity, AssetComponent)
      const loadedComp = getComponent(entity, AssetLoadedComponent)
      assert(assetComp && loadedComp, 'Asset and AssetLoaded components exist')
      assert.equal(assetComp.loaded, LoadState.LOADED, 'Asset state is set to loaded')
    })

    it('Calls load, then is deleted', async () => {
      addComponent(entity, AssetComponent, {
        path: `${testDir}/empty.xre.gltf`,
        name: 'empty',
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty.xre.gltf')))
      //delete entity
      removeEntityNodeFromParent(node, world.entityTree)
      removeEntity(entity)
      //check that frame executes
      world.execute(world.fixedDelta)
      assert.equal(getAllComponentsOfType(AssetComponent, world).length, 0, 'no Asset components in scene')
      assert.equal(getAllComponentsOfType(AssetLoadedComponent, world).length, 0, 'no AssetLoaded components in scene')
    })
  })

  describe('unloadAsset()', () => {
    it('Correctly handles unloading empty asset', async () => {
      addComponent(entity, AssetComponent, {
        path: `${testDir}/empty.xre.gltf`,
        name: 'empty',
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty.xre.gltf')))
      //execute frame
      world.execute(world.fixedDelta)
      //unload asset
      unloadAsset(entity)
      //execute frame
      world.execute(world.fixedDelta)
      //ensure that asset system does not try to load asset
      assert(!hasComponent(entity, AssetLoadedComponent), 'AssetLoaded component does not exist')
      const assetComp = getComponent(entity, AssetComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
    })

    it('Correctly handles unloading basic asset file', async () => {
      addComponent(entity, AssetComponent, {
        path: `${testDir}/empty_model.xre.gltf`,
        name: 'empty',
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty_model.xre.gltf')))
      //execute frame
      world.execute(world.fixedDelta)
      //unload asset
      unloadAsset(entity)
      //execute frame
      world.execute(world.fixedDelta)
      //ensure that asset system does not try to load asset
      assert(!hasComponent(entity, AssetLoadedComponent), 'AssetLoaded component does not exist')
      const assetComp = getComponent(entity, AssetComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
      //check that asset child hierarchy is removed
      assert(node.children == undefined || node.children.length === 0, 'child hierarchy is removed')
    })

    it('Correctly handles unloading empty asset', async () => {
      addComponent(entity, AssetComponent, {
        path: `${testDir}/empty.xre.gltf`,
        name: 'empty',
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty.xre.gltf')))
      //execute frame
      world.execute(world.fixedDelta)
      //unload asset
      unloadAsset(entity)
      //unload asset again
      unloadAsset(entity)
      //execute frame
      world.execute(world.fixedDelta)
      //ensure that asset system does not try to load asset
      assert(!hasComponent(entity, AssetLoadedComponent), 'AssetLoaded component does not exist')
      const assetComp = getComponent(entity, AssetComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
    })
  })

  //TODO:
  //test can serialize scene to file
  //test can deserialize file into scene
  //test serialize multiple assets at once
  //test deserialize multiple assets at once
  //test nested serialization
  //test nested deserialization
})
