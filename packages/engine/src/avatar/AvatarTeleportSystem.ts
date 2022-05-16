import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  TorusGeometry,
  Vector3
} from 'three'

import { Deg2Rad, normalizeRange, rotate } from '@atlasfoundation/common/src/utils/mathUtils'

import checkPositionIsValid from '../common/functions/checkPositionIsValid'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { addComponent, defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { AvatarSwerveComponent } from './components/AvatarSwerveComponent'
import { AvatarTeleportTagComponent } from './components/AvatarTeleportTagComponent'
import { teleportAvatar } from './functions/moveAvatar'

// Guideline parabola function
const positionAtT = (inVec: Vector3, t: number, p: Vector3, v: Vector3, gravity: Vector3): Vector3 => {
  inVec.copy(p)
  inVec.addScaledVector(v, t)
  inVec.addScaledVector(gravity, 0.5 * t ** 2)
  return inVec
}

// Utility Vectors
// Unit: m/s
const initialVelocity = 6
const dynamicVelocity = 10
const gravity = new Vector3(0, -9.8, 0)
const currentVertexLocal = new Vector3()
const currentVertexWorld = new Vector3()
const nextVertexWorld = new Vector3()
const tempVecP = new Vector3()
const tempVecV = new Vector3()

const swerveByDegrees = 15
const tempSwerveVec = new Vector3()

const white = new Color('white')
const red = new Color('red')

const getParabolaInputParams = (
  controller: Group,
  initialVelocity: number,
  gravity: Vector3
): { p: Vector3; v: Vector3; t: number } => {
  // Controller start position
  const p = controller.getWorldPosition(tempVecP)

  // Set Vector V to the direction of the controller, at 1m/s
  const v = controller.getWorldDirection(tempVecV)

  // Scale the initial velocity
  let normalizedYDirection = 1 - normalizeRange(v.y, -1, 1)
  v.multiplyScalar(initialVelocity + dynamicVelocity * normalizedYDirection)

  // Time for tele ball to hit ground
  const t = (-v.y + Math.sqrt(v.y ** 2 - 2 * p.y * gravity.y)) / gravity.y

  return {
    p,
    v,
    t
  }
}

const stopGuidelineAtVertex = (vertex: Vector3, line: Float32Array, startIndex: number, lineSegments: number) => {
  for (let i = startIndex; i <= lineSegments; i++) {
    vertex.toArray(line, i * 3)
  }
}

export default async function AvatarTeleportSystem(world: World) {
  // The guideline
  const lineSegments = 10
  const lineGeometry = new BufferGeometry()
  const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3)
  lineGeometryVertices.fill(0)
  const lineGeometryColors = new Float32Array((lineSegments + 1) * 3)
  lineGeometryColors.fill(0.5)
  lineGeometry.setAttribute('position', new BufferAttribute(lineGeometryVertices, 3))
  lineGeometry.setAttribute('color', new BufferAttribute(lineGeometryColors, 3))
  const lineMaterial = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
  const guideline = new Line(lineGeometry, lineMaterial)

  // The guide cursor at the end of the line
  const guideCursorGeometry = new TorusGeometry(1, 0.1, 10, 20)
  const guideCursorMaterial = new MeshBasicMaterial({ color: 0xffff00 })
  const guideCursorTorusMesh = new Mesh(guideCursorGeometry, guideCursorMaterial)
  const guideCursor = new Object3D()
  guideCursor.add(guideCursorTorusMesh)
  guideCursor.scale.set(0.2, 0.2, 0.2)
  guideCursor.lookAt(0, 1, 0)
  guideCursor.visible = false

  const guideCursorEntity = createEntity()
  addComponent(guideCursorEntity, Object3DComponent, { value: guideCursor })

  let guidingController = null! as Group
  let canTeleport = false

  const avatarTeleportQuery = defineQuery([AvatarTeleportTagComponent])
  const avatarSwerveQuery = defineQuery([AvatarSwerveComponent])
  return () => {
    for (const entity of avatarSwerveQuery.enter(world)) {
      const avatarSewerveComponent = getComponent(entity, AvatarSwerveComponent)
      const cameraParentRotation = Engine.instance.currentWorld.camera.parent?.rotation
      if (cameraParentRotation) {
        let rad = swerveByDegrees * Deg2Rad()
        tempSwerveVec.copy(avatarSewerveComponent.axis).multiplyScalar(rad)

        const quat = new Quaternion().copy(Engine.instance.currentWorld.camera.parent!.quaternion)
        rotate(quat, tempSwerveVec.x, tempSwerveVec.y, tempSwerveVec.z)
        cameraParentRotation.setFromQuaternion(quat)
      }
    }

    for (const entity of avatarTeleportQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const controller = xrInputSourceComponent.controllerRight
      guidingController = controller
      guidingController.add(guideline)
    }

    for (const entity of avatarTeleportQuery(world)) {
      if (guidingController) {
        const { p, v, t } = getParabolaInputParams(guidingController, initialVelocity, gravity)

        lineGeometryVertices.fill(0)
        currentVertexLocal.set(0, 0, 0)
        let lastValidationData
        let guidelineBlocked = false
        let i = 0
        for (i = 1; i <= lineSegments && !guidelineBlocked; i++) {
          // set vertex to current position of the virtual ball at time t
          positionAtT(currentVertexWorld, (i * t) / lineSegments, p, v, gravity)
          currentVertexLocal.copy(currentVertexWorld)
          guidingController.worldToLocal(currentVertexLocal)
          currentVertexLocal.toArray(lineGeometryVertices, i * 3)

          positionAtT(nextVertexWorld, ((i + 1) * t) / lineSegments, p, v, gravity)
          const currentVertexDirection = nextVertexWorld.subVectors(nextVertexWorld, currentVertexWorld)

          const validationData = checkPositionIsValid(currentVertexWorld, false, currentVertexDirection)
          if (validationData.raycastHit !== null) {
            guidelineBlocked = true
            currentVertexWorld.copy(validationData.raycastHit.position)
          }

          lastValidationData = validationData
        }

        lastValidationData.positionValid ? (canTeleport = true) : (canTeleport = false)

        // Line should extend only up to last valid vertex
        currentVertexLocal.copy(currentVertexWorld)
        guidingController.worldToLocal(currentVertexLocal)
        currentVertexLocal.toArray(lineGeometryVertices, i * 3)
        stopGuidelineAtVertex(currentVertexLocal, lineGeometryVertices, i + 1, lineSegments)
        guideline.geometry.attributes.position.needsUpdate = true

        if (canTeleport) {
          // Place the cursor near the end of the line
          guideCursor.position.copy(currentVertexWorld)
          guideCursor.visible = true
          lineMaterial.color = white
        } else {
          guideCursor.visible = false
          lineMaterial.color = red
        }
      }
    }

    for (const entity of avatarTeleportQuery.exit(world)) {
      // Get cursor position and teleport avatar to it
      if (canTeleport) teleportAvatar(entity, guideCursor.position)

      guideCursor.visible = false
      guidingController.remove(guideline)
    }
  }
}
