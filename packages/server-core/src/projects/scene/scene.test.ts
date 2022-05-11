import appRootPath from 'app-root-path'
import assert from 'assert'
import _ from 'lodash'
import path from 'path'

import defaultSceneSeed from '@atlas/projects/default-project/default.scene.json'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'
import { parseSceneDataCacheURLs } from './scene-parser'

const storageProvider = useStorageProvider()
const parsedData = parseSceneDataCacheURLs(_.cloneDeep(defaultSceneSeed) as any, storageProvider.cacheDomain)

const defaultProjectName = 'default-project'
const defaultSceneName = 'default'

const newProjectName = 'SceneTest_test_project_name'
const newSceneName = 'SceneTest_test_scene_name'
const newestSceneName = 'SceneTest_test_scene_rename'

const params = { isInternal: true }

describe('scene.test', () => {
  let app: Application
  before(() => {
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName}/`)
    deleteFolderRecursive(projectDir)
    app = createFeathersExpressApp()
  })

  // wait for initial project loading to occur in CI/CD
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
  })

  describe("'scene-data' service", () => {
    describe('get', () => {
      it('should get default test scene', async function () {
        const { data } = await app.service('scene-data').get(
          {
            projectName: defaultProjectName,
            metadataOnly: false,
            internal: true
          },
          params
        )
        assert.deepStrictEqual(parsedData, data.find((entry) => entry.name === defaultSceneName)!.scene)
      })
    })

    describe('find', () => {
      it('should get all scenes for a project scenes', async function () {
        const { data } = await app.service('scene-data').find({
          ...params
        })
        assert.deepStrictEqual(parsedData, data.find((entry) => entry.name === defaultSceneName)!.scene)
        assert(data.length > 0)
        data.forEach((scene) => {
          assert(typeof scene.name === 'string')
          assert(typeof scene.project === 'string')
          assert(typeof scene.thumbnailUrl === 'string')
          assert(typeof scene.scene === 'object')
        })
      })

      it('should get all scenes for a project scenes with metadata only', async function () {
        const { data } = await app.service('scene-data').find({
          ...params,
          metadataOnly: true
        })
        assert(data.length > 0)
        data.forEach((scene) => {
          assert(typeof scene.name === 'string')
          assert(typeof scene.project === 'string')
          assert(typeof scene.thumbnailUrl === 'string')
          assert(typeof scene.scene === 'undefined')
        })
      })
    })
  })

  describe("'scene' service", () => {
    before(async () => {
      await app.service('project').create(
        {
          name: newProjectName
        },
        params
      )
    })

    after(async () => {
      const { data } = await app.service('project').get(newProjectName, params)
      await app.service('project').remove(data.id, params)
    })

    describe('get', () => {
      it('should get default scene data', async function () {
        const { data } = await app.service('scene').get(
          {
            projectName: defaultProjectName,
            sceneName: defaultSceneName,
            metadataOnly: false
          },
          params
        )
        const entities = Object.values(data.scene!.entities)
        assert.strictEqual(entities.length, 8)
      })
    })

    describe('update', () => {
      it('should add new scene', async function () {
        await app.service('scene').update(
          newProjectName,
          {
            sceneName: newSceneName
          },
          params
        )
        const { data } = await app.service('scene').get(
          {
            projectName: newProjectName,
            sceneName: newSceneName,
            metadataOnly: false
          },
          params
        )
        assert.strictEqual(data.name, newSceneName)
        assert.deepStrictEqual(data.scene, parsedData)
      })

      it('should save scene', async function () {
        await app.service('scene').update(
          newProjectName,
          {
            sceneData: _.cloneDeep(parsedData),
            sceneName: newSceneName
          },
          params
        )
        const { data } = await app.service('scene').get(
          {
            projectName: newProjectName,
            sceneName: newSceneName,
            metadataOnly: false
          },
          params
        )
        assert.deepStrictEqual(data.name, newSceneName)
        assert.deepStrictEqual(data.scene, parsedData)
      })
    })

    describe('patch', () => {
      it('should rename scene', async function () {
        await app
          .service('scene')
          .patch(
            null,
            { newSceneName: newestSceneName, oldSceneName: newSceneName, projectName: newProjectName },
            params
          )
        const { data } = await app.service('scene').get(
          {
            projectName: newProjectName,
            sceneName: newestSceneName,
            metadataOnly: false
          },
          params
        )
        assert.strictEqual(data.name, newestSceneName)
      })
    })

    describe('remove', () => {
      it('should remove scene', async function () {
        await app.service('scene').remove(
          {
            projectName: newProjectName,
            sceneName: newSceneName
          },
          params
        )
        assert.rejects(async () => {
          await app.service('scene').get(
            {
              projectName: newProjectName,
              sceneName: newSceneName,
              metadataOnly: true
            },
            params
          )
        })
      })
    })
  })
})
