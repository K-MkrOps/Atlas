import i18n from 'i18next'

import { client } from '@atlas/client-core/src/feathers'
import { SceneData } from '@atlas/common/src/interfaces/SceneInterface'
import { serializeWorld } from '@atlas/engine/src/scene/functions/serializeWorld'

/**
 * getScenes used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getScenes = async (projectName: string): Promise<SceneData[]> => {
  try {
    const result = await client.service('scene-data').get({ projectName, metadataOnly: true })
    return result?.data
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

/**
 * Function to get project data.
 *
 * @param projectId
 * @returns
 */
export const getScene = async (projectName: string, sceneName: string, metadataOnly = true): Promise<SceneData> => {
  try {
    const { data } = await client.service('scene').get({ projectName, sceneName, metadataOnly })
    return data
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

/**
 * deleteScene used to delete project using projectId.
 *
 * @param  {any}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (projectName, sceneName): Promise<any> => {
  try {
    await client.service('scene').remove({ projectName, sceneName })
  } catch (error) {
    console.log('Error in deleting Project:' + error)
    throw new Error(error)
  }
  return true
}

export const renameScene = async (projectName: string, newSceneName: string, oldSceneName: string): Promise<any> => {
  try {
    await client.service('scene').patch(null, { newSceneName, oldSceneName, projectName })
  } catch (error) {
    console.log('Error in renaming Project:' + error)
    throw new Error(error)
  }
  return true
}

/**
 * saveScene used to save changes in existing project.
 *
 * @param  {any}  sceneName
 * @param  {any}  signal
 * @return {Promise}
 */
export const saveScene = async (
  projectName: string,
  sceneName: string,
  thumbnailBlob: Blob | null,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const thumbnailBuffer = thumbnailBlob ? await thumbnailBlob.arrayBuffer() : undefined

  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const sceneData = serializeWorld()

  try {
    return await client.service('scene').update(projectName, { sceneName, sceneData, thumbnailBuffer })
  } catch (error) {
    console.error('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

export const createNewScene = async (projectName: string): Promise<{ projectName: string; sceneName: string }> => {
  try {
    return client.service('scene').create({ projectName })
  } catch (error) {
    console.error('Error in Getting Project:' + error)
    throw new Error(error)
  }
}
