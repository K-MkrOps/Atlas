import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import { getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@atlas/engine/src/scene/components/EntityNodeComponent'
import { SCENE_COMPONENT_SCENE_TAG } from '@atlas/engine/src/scene/components/SceneTagComponent'
import { SCENE_COMPONENT_AMBIENT_LIGHT } from '@atlas/engine/src/scene/functions/loaders/AmbientLightFunctions'
import { SCENE_COMPONENT_ASSET } from '@atlas/engine/src/scene/functions/loaders/AssetComponentFunctions'
import { SCENE_COMPONENT_AUDIO } from '@atlas/engine/src/scene/functions/loaders/AudioFunctions'
import { SCENE_COMPONENT_BOX_COLLIDER } from '@atlas/engine/src/scene/functions/loaders/BoxColliderFunctions'
import { SCENE_COMPONENT_CAMERA_PROPERTIES } from '@atlas/engine/src/scene/functions/loaders/CameraPropertiesFunctions'
import { SCENE_COMPONENT_CLOUD } from '@atlas/engine/src/scene/functions/loaders/CloudFunctions'
import { SCENE_COMPONENT_CUBEMAP_BAKE } from '@atlas/engine/src/scene/functions/loaders/CubemapBakeFunctions'
import { SCENE_COMPONENT_DIRECTIONAL_LIGHT } from '@atlas/engine/src/scene/functions/loaders/DirectionalLightFunctions'
import { SCENE_COMPONENT_GROUND_PLANE } from '@atlas/engine/src/scene/functions/loaders/GroundPlaneFunctions'
import { SCENE_COMPONENT_GROUP } from '@atlas/engine/src/scene/functions/loaders/GroupFunctions'
import { SCENE_COMPONENT_HEMISPHERE_LIGHT } from '@atlas/engine/src/scene/functions/loaders/HemisphereLightFunctions'
import { SCENE_COMPONENT_IMAGE } from '@atlas/engine/src/scene/functions/loaders/ImageFunctions'
import { SCENE_COMPONENT_INTERIOR } from '@atlas/engine/src/scene/functions/loaders/InteriorFunctions'
import { SCENE_COMPONENT_MODEL } from '@atlas/engine/src/scene/functions/loaders/ModelFunctions'
import { SCENE_COMPONENT_OCEAN } from '@atlas/engine/src/scene/functions/loaders/OceanFunctions'
import { SCENE_COMPONENT_PARTICLE_EMITTER } from '@atlas/engine/src/scene/functions/loaders/ParticleEmitterFunctions'
import { SCENE_COMPONENT_POINT_LIGHT } from '@atlas/engine/src/scene/functions/loaders/PointLightFunctions'
import { SCENE_COMPONENT_PORTAL } from '@atlas/engine/src/scene/functions/loaders/PortalFunctions'
import { SCENE_COMPONENT_POSTPROCESSING } from '@atlas/engine/src/scene/functions/loaders/PostprocessingFunctions'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA } from '@atlas/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import { SCENE_COMPONENT_SKYBOX } from '@atlas/engine/src/scene/functions/loaders/SkyboxFunctions'
import { SCENE_COMPONENT_SPAWN_POINT } from '@atlas/engine/src/scene/functions/loaders/SpawnPointFunctions'
import { SCENE_COMPONENT_SPLINE } from '@atlas/engine/src/scene/functions/loaders/SplineFunctions'
import { SCENE_COMPONENT_SPOT_LIGHT } from '@atlas/engine/src/scene/functions/loaders/SpotLightFunctions'
import { SCENE_COMPONENT_SYSTEM } from '@atlas/engine/src/scene/functions/loaders/SystemFunctions'
import { SCENE_COMPONENT_TRIGGER_VOLUME } from '@atlas/engine/src/scene/functions/loaders/TriggerVolumeFunctions'
import { SCENE_COMPONENT_VIDEO } from '@atlas/engine/src/scene/functions/loaders/VideoFunctions'
import { SCENE_COMPONENT_VOLUMETRIC } from '@atlas/engine/src/scene/functions/loaders/VolumetricFunctions'
import { SCENE_COMPONENT_WATER } from '@atlas/engine/src/scene/functions/loaders/WaterFunctions'
import { ScenePrefabs } from '@atlas/engine/src/scene/functions/registerPrefabs'

import AmbientLightNodeEditor from '../components/properties/AmbientLightNodeEditor'
import { AssetNodeEditor } from '../components/properties/AssetNodeEditor'
import AudioNodeEditor from '../components/properties/AudioNodeEditor'
import BoxColliderNodeEditor from '../components/properties/BoxColliderNodeEditor'
import CameraPropertiesNodeEditor from '../components/properties/CameraPropertiesNodeEditor'
import CloudsNodeEditor from '../components/properties/CloudsNodeEditor'
import CubemapBakeNodeEditor from '../components/properties/CubemapBakeNodeEditor'
import { DefaultNodeEditor } from '../components/properties/DefaultNodeEditor'
import DirectionalLightNodeEditor from '../components/properties/DirectionalLightNodeEditor'
import GroundPlaneNodeEditor from '../components/properties/GroundPlaneNodeEditor'
import GroupNodeEditor from '../components/properties/GroupNodeEditor'
import HemisphereLightNodeEditor from '../components/properties/HemisphereLightNodeEditor'
import ImageNodeEditor from '../components/properties/ImageNodeEditor'
import InteriorNodeEditor from '../components/properties/InteriorNodeEditor'
import ModelNodeEditor from '../components/properties/ModelNodeEditor'
import OceanNodeEditor from '../components/properties/OceanNodeEditor'
import ParticleEmitterNodeEditor from '../components/properties/ParticleEmitterNodeEditor'
import PointLightNodeEditor from '../components/properties/PointLightNodeEditor'
import PortalNodeEditor from '../components/properties/PortalNodeEditor'
import PostProcessingNodeEditor from '../components/properties/PostProcessingNodeEditor'
import SceneNodeEditor from '../components/properties/SceneNodeEditor'
import ScenePreviewCameraNodeEditor from '../components/properties/ScenePreviewCameraNodeEditor'
import SkyboxNodeEditor from '../components/properties/SkyboxNodeEditor'
import SpawnPointNodeEditor from '../components/properties/SpawnPointNodeEditor'
import SplineNodeEditor from '../components/properties/SplineNodeEditor'
import SpotLightNodeEditor from '../components/properties/SpotLightNodeEditor'
import SystemNodeEditor from '../components/properties/SystemNodeEditor'
import TriggerVolumeNodeEditor from '../components/properties/TriggerVolumeNodeEditor'
import { EditorComponentType } from '../components/properties/Util'
import VideoNodeEditor from '../components/properties/VideoNodeEditor'
import VolumetricNodeEditor from '../components/properties/VolumetricNodeEditor'
import WaterNodeEditor from '../components/properties/WaterNodeEditor'

export const getNodeEditorsForEntity = (entity: Entity): EditorComponentType[] => {
  const entityNode = getComponent(entity, EntityNodeComponent)
  if (!entityNode) return [DefaultNodeEditor]

  const editors = [] as EditorComponentType[]

  for (let i = 0; i < entityNode.components.length; i++) {
    if (EntityNodeEditor[entityNode.components[i]]) editors.push(EntityNodeEditor[entityNode.components[i]])
  }

  return editors.length ? editors : [DefaultNodeEditor]
}

export const EntityNodeEditor = {
  [SCENE_COMPONENT_DIRECTIONAL_LIGHT]: DirectionalLightNodeEditor,
  [SCENE_COMPONENT_HEMISPHERE_LIGHT]: HemisphereLightNodeEditor,
  [SCENE_COMPONENT_AMBIENT_LIGHT]: AmbientLightNodeEditor,
  [SCENE_COMPONENT_POINT_LIGHT]: PointLightNodeEditor,
  [SCENE_COMPONENT_SPOT_LIGHT]: SpotLightNodeEditor,
  [SCENE_COMPONENT_GROUND_PLANE]: GroundPlaneNodeEditor,
  [SCENE_COMPONENT_CAMERA_PROPERTIES]: CameraPropertiesNodeEditor,
  [SCENE_COMPONENT_MODEL]: ModelNodeEditor,
  [SCENE_COMPONENT_PARTICLE_EMITTER]: ParticleEmitterNodeEditor,
  [SCENE_COMPONENT_PORTAL]: PortalNodeEditor,
  [SCENE_COMPONENT_TRIGGER_VOLUME]: TriggerVolumeNodeEditor,
  [SCENE_COMPONENT_BOX_COLLIDER]: BoxColliderNodeEditor,
  [SCENE_COMPONENT_GROUP]: GroupNodeEditor,
  [SCENE_COMPONENT_ASSET]: AssetNodeEditor,
  [SCENE_COMPONENT_POSTPROCESSING]: PostProcessingNodeEditor,
  [SCENE_COMPONENT_SCENE_TAG]: SceneNodeEditor,
  [SCENE_COMPONENT_SCENE_PREVIEW_CAMERA]: ScenePreviewCameraNodeEditor,
  [SCENE_COMPONENT_SKYBOX]: SkyboxNodeEditor,
  [SCENE_COMPONENT_SPAWN_POINT]: SpawnPointNodeEditor,
  [SCENE_COMPONENT_IMAGE]: ImageNodeEditor,
  [SCENE_COMPONENT_AUDIO]: AudioNodeEditor,
  [SCENE_COMPONENT_VIDEO]: VideoNodeEditor,
  [SCENE_COMPONENT_VOLUMETRIC]: VolumetricNodeEditor,
  [SCENE_COMPONENT_CLOUD]: CloudsNodeEditor,
  [SCENE_COMPONENT_OCEAN]: OceanNodeEditor,
  [SCENE_COMPONENT_WATER]: WaterNodeEditor,
  [SCENE_COMPONENT_INTERIOR]: InteriorNodeEditor,
  [SCENE_COMPONENT_SYSTEM]: SystemNodeEditor,
  [SCENE_COMPONENT_SPLINE]: SplineNodeEditor,
  [SCENE_COMPONENT_CUBEMAP_BAKE]: CubemapBakeNodeEditor
}

export const prefabIcons = {
  [ScenePrefabs.ambientLight]: AmbientLightNodeEditor.iconComponent,
  [ScenePrefabs.pointLight]: PointLightNodeEditor.iconComponent,
  [ScenePrefabs.spotLight]: SpotLightNodeEditor.iconComponent,
  [ScenePrefabs.directionalLight]: DirectionalLightNodeEditor.iconComponent,
  [ScenePrefabs.hemisphereLight]: HemisphereLightNodeEditor.iconComponent,
  [ScenePrefabs.groundPlane]: GroundPlaneNodeEditor.iconComponent,
  [ScenePrefabs.model]: ModelNodeEditor.iconComponent,
  [ScenePrefabs.cameraProperties]: CameraPropertiesNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.particleEmitter]: ParticleEmitterNodeEditor.iconComponent,
  [ScenePrefabs.portal]: PortalNodeEditor.iconComponent,
  [ScenePrefabs.triggerVolume]: TriggerVolumeNodeEditor.iconComponent,
  [ScenePrefabs.boxCollider]: BoxColliderNodeEditor.iconComponent,
  [ScenePrefabs.group]: GroupNodeEditor.iconComponent,
  [ScenePrefabs.asset]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.postProcessing]: PostProcessingNodeEditor.iconComponent,
  [ScenePrefabs.previewCamera]: ScenePreviewCameraNodeEditor.iconComponent,
  [ScenePrefabs.skybox]: SkyboxNodeEditor.iconComponent,
  [ScenePrefabs.spawnPoint]: SpawnPointNodeEditor.iconComponent,
  [ScenePrefabs.image]: ImageNodeEditor.iconComponent,
  [ScenePrefabs.audio]: AudioNodeEditor.iconComponent,
  [ScenePrefabs.video]: VideoNodeEditor.iconComponent,
  [ScenePrefabs.volumetric]: VolumetricNodeEditor.iconComponent,
  [ScenePrefabs.cloud]: CloudsNodeEditor.iconComponent,
  [ScenePrefabs.ocean]: OceanNodeEditor.iconComponent,
  [ScenePrefabs.water]: WaterNodeEditor.iconComponent,
  [ScenePrefabs.interior]: InteriorNodeEditor.iconComponent,
  [ScenePrefabs.system]: SystemNodeEditor.iconComponent,
  [ScenePrefabs.spline]: SplineNodeEditor.iconComponent,
  [ScenePrefabs.cubemapbake]: CubemapBakeNodeEditor.iconComponent
}
