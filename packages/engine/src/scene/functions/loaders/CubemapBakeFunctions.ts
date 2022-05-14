import {
  BoxBufferGeometry,
  BoxHelper,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3
} from 'three'

import { ComponentJson } from '@atlasfoundation/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '../../../ecs/functions/EntityTreeFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { CubemapBakeComponent, CubemapBakeComponentType } from '../../components/CubemapBakeComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { CubemapBakeRefreshTypes } from '../../types/CubemapBakeRefreshTypes'
import { CubemapBakeTypes } from '../../types/CubemapBakeTypes'
import { setObjectLayers } from '../setObjectLayers'

const quat = new Quaternion(0)
export const SCENE_COMPONENT_CUBEMAP_BAKE = 'cubemapbake'
export const SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES = {
  options: {
    bakePosition: { x: 0, y: 0, z: 0 },
    bakePositionOffset: { x: 0, y: 0, z: 0 },
    bakeScale: { x: 1, y: 1, z: 1 },
    bakeType: CubemapBakeTypes.Baked,
    resolution: 1024,
    refreshMode: CubemapBakeRefreshTypes.OnAwake,
    envMapOrigin: '',
    boxProjection: true
  }
}

export const deserializeCubemapBake: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CubemapBakeComponentType>
) => {
  const obj3d = new Object3D()
  addComponent(entity, Object3DComponent, { value: obj3d })
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_CUBEMAP_BAKE)

  if (!Engine.instance.isEditor) return

  const props = parseCubemapBakeProperties(json.props)
  addComponent(entity, CubemapBakeComponent, props)
  addComponent(entity, PreventBakeTagComponent, {})

  obj3d.userData.centerBall = new Mesh(
    new SphereGeometry(0.75),
    new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })
  )
  obj3d.userData.centerBall.userData.disableOutline = true
  obj3d.add(obj3d.userData.centerBall)

  obj3d.userData.gizmo = new BoxHelper(new Mesh(new BoxBufferGeometry()), 0xff0000)
  obj3d.userData.gizmo.userData.disableOutline = true
  obj3d.add(obj3d.userData.gizmo)

  setObjectLayers(obj3d, ObjectLayers.NodeHelper)
  updateCubemapBake(entity)
}

export const updateCubemapBake: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const bakeComponent = getComponent(entity, CubemapBakeComponent)
  if (obj3d.userData.gizmo)
    obj3d.userData.gizmo.matrix.compose(bakeComponent.options.bakePositionOffset, quat, bakeComponent.options.bakeScale)
}

export const serializeCubemapBake: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, CubemapBakeComponent) as CubemapBakeComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_CUBEMAP_BAKE,
    props: {
      options: component.options
    }
  }
}

export const prepareSceneForBake = (world = useWorld()): Scene => {
  const scene = Engine.instance.scene.clone(false)
  const parents = {
    [world.entityTree.rootNode.entity]: scene
  } as { [key: Entity]: Object3D }

  traverseEntityNode(world.entityTree.rootNode, (node) => {
    if (node === world.entityTree.rootNode || hasComponent(node.entity, PreventBakeTagComponent)) return

    const obj3d = getComponent(node.entity, Object3DComponent)?.value as Mesh<any, MeshStandardMaterial>

    if (obj3d) {
      const newObj = obj3d.clone(false)
      if (newObj.material) {
        newObj.material = obj3d.material.clone()
        newObj.material.roughness = 1
      }
      if (node.parentEntity) parents[node.parentEntity].add(newObj)
      parents[node.entity] = newObj
    }
  })

  return scene
}

export const parseCubemapBakeProperties = (props): CubemapBakeComponentType => {
  const result = {
    options: {
      bakeType: props.options.bakeType ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.bakeType,
      resolution: props.options.resolution ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.resolution,
      refreshMode: props.options.refreshMode ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.refreshMode,
      envMapOrigin: props.options.envMapOrigin ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.envMapOrigin,
      boxProjection: props.options.boxProjection ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.boxProjection
    }
  } as CubemapBakeComponentType

  let tempV3 = props.options.bakePosition ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.bakePosition
  result.options.bakePosition = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.options.bakePositionOffset ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.bakePositionOffset
  result.options.bakePositionOffset = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.options.bakeScale ?? SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES.options.bakeScale
  result.options.bakeScale = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  return result
}
