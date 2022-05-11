import { CameraHelper, Matrix4, PerspectiveCamera } from 'three'

import { ComponentJson } from '@atlas/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent
} from '../../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ScenePreviewCameraTagComponent } from '../../components/ScenePreviewCamera'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { setObjectLayers } from '../setObjectLayers'

export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA = 'scene-preview-camera'
export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA_DEFAULT_VALUES = {}
export const SCENE_PREVIEW_CAMERA_HELPER = 'scene-preview-camera-helper'

export const deserializeScenePreviewCamera: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  if (!isClient) return

  addComponent(entity, ScenePreviewCameraTagComponent, {})
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)

  if (Engine.instance.isEditor) {
    const camera = new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    camera.userData.helper = new CameraHelper(camera)
    camera.userData.helper.name = SCENE_PREVIEW_CAMERA_HELPER
    setObjectLayers(camera.userData.helper, ObjectLayers.NodeHelper)

    addComponent(entity, Object3DComponent, { value: camera })
  } else if (Engine.instance.activeCameraEntity) {
    const transformComponent = getComponent(entity, TransformComponent)
    Engine.instance.camera.position.copy(transformComponent.position)
  }
}

export const updateCameraTransform = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const transformComponent = getComponent(entity, TransformComponent)

  return new Matrix4()
    .copy(obj3d.parent!.matrixWorld)
    .invert()
    .multiply(Engine.instance.camera.matrixWorld)
    .decompose(transformComponent.position, transformComponent.rotation, transformComponent.scale)
}

export const updateScenePreviewCamera: ComponentUpdateFunction = (entity: Entity) => {}

export const serializeScenePreviewCamera: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, ScenePreviewCameraTagComponent)) {
    return {
      name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
      props: {}
    }
  }
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(ScenePreviewCameraTagComponent) <= 0
}
