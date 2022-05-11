import i18next from 'i18next'
import {
  AnimationMixer,
  Box3,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer
} from 'three'

import { MAX_ALLOWED_TRIANGLES } from '@atlas/common/src/constants/AvatarConstants'
import { AnimationState } from '@atlas/engine/src/avatar/animation/AnimationState'
import { AvatarAnimationGraph } from '@atlas/engine/src/avatar/animation/AvatarAnimationGraph'
import { BoneStructure } from '@atlas/engine/src/avatar/AvatarBoneMatching'
import { AnimationComponent } from '@atlas/engine/src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '@atlas/engine/src/avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent } from '@atlas/engine/src/avatar/components/LoopAnimationComponent'
import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import { World } from '@atlas/engine/src/ecs/classes/World'
import { addComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { initSystems } from '@atlas/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@atlas/engine/src/ecs/functions/SystemUpdateType'
import { VelocityComponent } from '@atlas/engine/src/physics/components/VelocityComponent'

const t = i18next.t
interface SceneProps {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
}

let scene: Scene = null!
let renderer: WebGLRenderer = null!
let camera: PerspectiveCamera = null!
export const validate = (obj) => {
  const objBoundingBox = new Box3().setFromObject(obj)
  let maxBB = new Vector3(2, 3, 2)

  let bone = false
  let skinnedMesh = false
  obj.traverse((o) => {
    if (o.type.toLowerCase() === 'bone') bone = true
    if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
  })

  const size = new Vector3().subVectors(maxBB, objBoundingBox.getSize(new Vector3()))
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return t('user:avatar.outOfBound')

  if (!bone || !skinnedMesh) return t('user:avatar.noBone')

  renderer.render(scene, camera)
  if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
    return t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

  if (renderer.info.render.triangles <= 0) return t('user:avatar.emptyObj')

  return ''
}

export const addAnimationLogic = (
  entity: Entity,
  world: World,
  panelRef: React.MutableRefObject<HTMLDivElement | undefined>
) => {
  addComponent(entity, AnimationComponent, {
    // empty object3d as the mixer gets replaced when model is loaded
    mixer: new AnimationMixer(new Object3D()),
    animations: [],
    animationSpeed: 1
  })
  addComponent(entity, LoopAnimationComponent, {
    activeClipIndex: 0,
    hasAvatarAnimations: true,
    action: null!
  })
  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: new AvatarAnimationGraph(),
    currentState: new AnimationState(),
    prevState: new AnimationState(),
    prevVelocity: new Vector3(),
    rig: {} as BoneStructure,
    rootYRatio: 1
  })
  addComponent(entity, VelocityComponent, { linear: new Vector3(), angular: new Vector3() })

  async function AvatarSelectRenderSystem(world: World) {
    return () => {
      // only render if this menu is open
      if (!!panelRef.current) {
        renderer.render(scene, camera)
      }
    }
  }

  initSystems(world, [
    {
      type: SystemUpdateType.POST_RENDER,
      systemModulePromise: Promise.resolve({ default: AvatarSelectRenderSystem })
    }
  ])
}

export const initialize3D = () => {
  const container = document.getElementById('stage')!
  const bounds = container.getBoundingClientRect()
  camera = new PerspectiveCamera(60, bounds.width / bounds.height, 0.25, 20)
  camera.position.set(0, 1.5, 0.6)

  scene = new Scene()

  const backLight = new DirectionalLight(0xfafaff, 0.5)
  backLight.position.set(1, 3, -1)
  backLight.target.position.set(0, 1.5, 0)
  const frontLight = new DirectionalLight(0xfafaff, 0.4)
  frontLight.position.set(-1, 3, 1)
  frontLight.target.position.set(0, 1.5, 0)
  const hemi = new HemisphereLight(0xffffff, 0xffffff, 1)
  scene.add(backLight)
  scene.add(backLight.target)
  scene.add(frontLight)
  scene.add(frontLight.target)
  scene.add(hemi)
  renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(bounds.width, bounds.height)
  renderer.outputEncoding = sRGBEncoding
  renderer.domElement.id = 'avatarCanvas'
  container.appendChild(renderer.domElement)

  return {
    scene,
    camera,
    renderer
  }
}

export const onWindowResize = (props: SceneProps) => {
  const container = document.getElementById('stage')
  const bounds = container?.getBoundingClientRect()!
  props.camera.aspect = bounds.width / bounds.height
  props.camera.updateProjectionMatrix()

  props.renderer.setSize(bounds.width, bounds.height)

  renderScene(props)
}

export const renderScene = (props: SceneProps) => {
  props.renderer.render(props.scene, props.camera)
}
