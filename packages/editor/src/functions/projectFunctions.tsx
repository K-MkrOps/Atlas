import { client } from '@atlas/client-core/src/feathers'
import { store } from '@atlas/client-core/src/store'
import { MultiError } from '@atlas/client-core/src/util/errors'
import { ProjectInterface } from '@atlas/common/src/interfaces/ProjectInterface'
import { SceneJson } from '@atlas/common/src/interfaces/SceneInterface'
import { AnimationManager } from '@atlas/engine/src/avatar/AnimationManager'
import { Engine } from '@atlas/engine/src/ecs/classes/Engine'
import { EngineActions } from '@atlas/engine/src/ecs/classes/EngineService'
import TransformGizmo from '@atlas/engine/src/scene/classes/TransformGizmo'
import { dispatchAction } from '@atlas/hyperflux'

import ErrorIcon from '../classes/ErrorIcon'
import { clearHistory, executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { removeInputEvents } from '../controls/InputEvents'
import { disposePlayModeControls } from '../controls/PlayModeControls'
import { copy, paste } from '../functions/copyPaste'
import { EditorErrorAction } from '../services/EditorErrorServices'
import { accessEditorState, EditorAction, TaskStatus } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
import { disposeScene, initializeScene } from './sceneRenderFunctions'

/**
 * Gets a list of projects installed
 * @returns {ProjectInterface[]}
 */
export const getProjects = async (): Promise<ProjectInterface[]> => {
  try {
    const { data } = await client.service('project').find()
    return data
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Runs tasks require prior to the project load.
 */
export async function runPreprojectLoadTasks(): Promise<void> {
  const editorState = accessEditorState()

  if (editorState.preprojectLoadTaskStatus.value === TaskStatus.NOT_STARTED) {
    store.dispatch(EditorAction.updatePreprojectLoadTask(TaskStatus.IN_PROGRESS))

    await Promise.all([ErrorIcon.load(), TransformGizmo.load(), AnimationManager.instance.loadDefaultAnimations()])

    store.dispatch(EditorAction.updatePreprojectLoadTask(TaskStatus.COMPLETED))
  }
}

/**
 * Loads scene from provided project file.
 */
export async function loadProjectScene(projectFile: SceneJson) {
  dispatchAction(Engine.instance.store, EngineActions.sceneUnloaded())

  executeCommand(EditorCommands.REPLACE_SELECTION, [])
  clearHistory()

  disposeProject()

  await runPreprojectLoadTasks()

  removeInputEvents()
  disposePlayModeControls()
  const errors = await initializeScene(projectFile)

  store.dispatch(EditorAction.projectLoaded(true))
  store.dispatch(SelectionAction.changedSceneGraph())

  if (errors && errors.length > 0) {
    const error = new MultiError('Errors loading project', errors)
    store.dispatch(EditorErrorAction.throwError(error))
    throw error
  }

  window.addEventListener('copy', copy)
  window.addEventListener('paste', paste)
}

/**
 * Disposes project data
 */
export function disposeProject() {
  disposeScene()
  removeInputEvents()
  disposePlayModeControls()
  store.dispatch(EditorAction.projectLoaded(false))

  window.addEventListener('copy', copy)
  window.addEventListener('paste', paste)
}
