import { Matrix4, OrthographicCamera, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import checkPositionIsValid from '../../common/functions/checkPositionIsValid'
import { smoothDamp } from '../../common/functions/MathLerpFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { XRCameraUpdatePendingTagComponent } from '../components/XRCameraUpdatePendingTagComponent'
import { getAvatarBoneWorldPosition } from './avatarFunctions'

const upVector = new Vector3(0, 1, 0)
const forward = new Vector3(0, 0, 1)

const quat = new Quaternion()
const mat4 = new Matrix4()
const tempVec1 = new Vector3()
const tempVec2 = new Vector3()
const tempVec3 = new Vector3()

const newVelocity = new Vector3()
const onGroundVelocity = new Vector3()
export const avatarCameraOffset = new Vector3(0, 0.14, 0.1)

export const moveAvatar = (world: World, entity: Entity, camera: PerspectiveCamera | OrthographicCamera): any => {
  const {
    fixedDelta,
    physics: { timeScale }
  } = world

  const timeStep = timeScale * fixedDelta

  const avatar = getComponent(entity, AvatarComponent)
  const velocity = getComponent(entity, VelocityComponent)
  const controller = getComponent(entity, AvatarControllerComponent)

  if (!controller.movementEnabled) return

  const onGround = controller.collisions[0] || avatar.isGrounded
  controller.isInAir = !onGround

  // move vec3 to controller input direction
  tempVec1.copy(controller.localMovementDirection).multiplyScalar(timeStep)

  // set velocity simulator target to vec3
  controller.velocitySimulator.target.copy(tempVec1)

  // step the velocity sim
  controller.velocitySimulator.simulate(timeStep * (onGround ? 1 : 0.2))

  // newVelocity = velocity sim position * moveSpeed
  const moveSpeed = controller.isWalking ? AvatarSettings.instance.walkSpeed : AvatarSettings.instance.runSpeed
  controller.currentSpeed = smoothDamp(controller.currentSpeed, moveSpeed, controller.speedVelocity, 0.1, timeStep)
  newVelocity.copy(controller.velocitySimulator.position).multiplyScalar(controller.currentSpeed)

  // avatar velocity = newVelocity (horizontal plane)
  velocity.linear.setX(newVelocity.x)
  velocity.linear.setZ(newVelocity.z)

  // apply gravity to avatar velocity
  velocity.linear.y -= 0.15 * timeStep

  // threejs camera is weird, when in VR we must use the head diretion
  if (hasComponent(entity, XRInputSourceComponent))
    getComponent(entity, XRInputSourceComponent).head.getWorldDirection(tempVec1)
  else camera.getWorldDirection(tempVec1)

  // vec3 holds state of (controller input * timeStep)
  // set y to 0 and normalize horizontal plane
  tempVec1.setY(0).normalize()

  // forward.z = 1
  // quat = forward w/(controller input * timeStep)
  quat.setFromUnitVectors(forward, tempVec1)

  // apply quat to avatar velocity (= velocity sim position * moveSpeed)
  newVelocity.applyQuaternion(quat)

  if (onGround) {
    // if we are falling
    if (velocity.linear.y < 0) {
      // look for something to fall onto
      const raycast = getComponent(entity, RaycastComponent)
      const closestHit = raycast.hits[0]

      // if something was found
      if (closestHit) {
        // groundVelocity = newVelocity (velocity sim w/quat applied)
        // zero out Y - horizontal plane
        onGroundVelocity.copy(newVelocity).setY(0)
        // vec3 = closestHit.normal
        tempVec1.set(closestHit.normal.x, closestHit.normal.y, closestHit.normal.z)
        // quat = upVector w/closestHit.normal
        quat.setFromUnitVectors(upVector, tempVec1)
        mat4.makeRotationFromQuaternion(quat)
        onGroundVelocity.applyMatrix4(mat4)
        velocity.linear.y = onGroundVelocity.y
      }
    }

    if (
      // if controller jump input pressed
      controller.localMovementDirection.y > 0 &&
      // and we are on the ground
      velocity.linear.y <= onGroundVelocity.y &&
      // and we are not already jumping
      !controller.isJumping
    ) {
      // jump
      velocity.linear.y = AvatarSettings.instance.jumpHeight / 60
      controller.isJumping = true
    } else if (controller.isJumping) {
      // reset isJumping the following frame
      controller.isJumping = false
    }

    // TODO: make a proper resizing function if we ever need it
    //  collider.controller.resize(avatar.BODY_SIZE);

    // TODO - Move on top of moving objects
    // physx has a feature for this, we should integrate both
    // if (avatar.rayResult.body.mass > 0) {
    // 	const pointVelocity = new Vector3();
    // 	avatar.rayResult.body.getVelocityAtWorldPoint(avatar.rayResult.hitPointWorld, pointVelocity);
    // 	newVelocity.add(threeFromCannonVector(pointVelocity));
    // }
  }

  // clamp velocities [-1 .. 1]
  if (Math.abs(velocity.linear.x) > 1) velocity.linear.x /= Math.abs(velocity.linear.x)
  if (Math.abs(velocity.linear.y) > 1) velocity.linear.y /= Math.abs(velocity.linear.y)
  if (Math.abs(velocity.linear.z) > 1) velocity.linear.z /= Math.abs(velocity.linear.z)
  if (Math.abs(newVelocity.x) > 1) newVelocity.x /= Math.abs(newVelocity.x)
  if (Math.abs(newVelocity.y) > 1) newVelocity.y /= Math.abs(newVelocity.y)
  if (Math.abs(newVelocity.z) > 1) newVelocity.z /= Math.abs(newVelocity.z)

  // min velocity of 0.001
  if (Math.abs(velocity.linear.x) < 0.001) velocity.linear.x = 0
  if (Math.abs(velocity.linear.y) < 0.001) velocity.linear.y = 0
  if (Math.abs(velocity.linear.z) < 0.001) velocity.linear.z = 0
  if (Math.abs(newVelocity.x) < 0.001) newVelocity.x = 0
  if (Math.abs(newVelocity.y) < 0.001) newVelocity.y = 0
  if (Math.abs(newVelocity.z) < 0.001) newVelocity.z = 0

  const displacement = {
    x: newVelocity.x,
    y: velocity.linear.y,
    z: newVelocity.z
  }

  moveAvatarController(world, entity, displacement)

  return displacement
}

/**
 * Rotates the avatar horizontally using HMD rotation
 *
 * @param world
 * @param entity
 * @param camera
 */
export const rotateXRAvatar = (world: World, entity: Entity, camera: PerspectiveCamera | OrthographicCamera) => {
  const avatarTransform = getComponent(entity, TransformComponent)

  const avatarFwd = tempVec1.set(0, 0, 1).applyQuaternion(avatarTransform.rotation).setY(0).normalize()
  const camFwd = tempVec2.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize()

  const angle = Math.acos(avatarFwd.dot(camFwd))
  const clamp = Math.PI * 0.5

  quat.identity()

  if (angle > clamp) {
    const deltaTarget = tempVec3.subVectors(camFwd, avatarFwd)
    // clamp delta target to within the ratio
    deltaTarget.multiplyScalar(clamp / angle)
    // set new target
    deltaTarget.add(avatarFwd).normalize()

    quat.setFromUnitVectors(deltaTarget, camFwd)

    avatarTransform.rotation.premultiply(quat)
  }

  tempVec1.subVectors(avatarTransform.position, camera.position).applyQuaternion(quat).add(camera.position)
  tempVec2.subVectors(tempVec1, avatarTransform.position).setY(0)

  const displacement = {
    x: tempVec2.x,
    y: 0,
    z: tempVec2.z
  }

  const velocity = getComponent(entity, VelocityComponent)
  velocity.linear.setX(displacement.x)
  velocity.linear.setZ(displacement.z)

  // Rotate around camera
  moveAvatarController(world, entity, displacement)
}

/**
 * Returns camera position based on avatar neck bone
 *
 * @param entity
 * @param offset In, offset from neck
 * @param position Out, camera position
 */
export const getAvatarCameraPosition = (entity: Entity, offset: Vector3, position: Vector3) => {
  getAvatarBoneWorldPosition(entity, 'Neck', position)
  const avatarTransform = getComponent(entity, TransformComponent)
  tempVec2.copy(offset)
  tempVec2.applyQuaternion(avatarTransform.rotation)
  position.add(tempVec2)
}

/**
 * NOTE: Use this function alongwith XRCameraUpdatePendingTagComponent always
 * Aligns the XR camra position with the avatar's neck
 * Note: There is a delay from when the camera parent's position is set and
 * the camera position is updated
 * @param entity
 * @param camera
 */
export const alignXRCameraPositionWithAvatar = (entity: Entity, camera: PerspectiveCamera | OrthographicCamera) => {
  const cameraContainerPos = camera.parent!.position
  tempVec1.subVectors(cameraContainerPos, camera.position)
  tempVec2.copy(avatarCameraOffset)
  getAvatarCameraPosition(entity, tempVec2, cameraContainerPos)
  cameraContainerPos.add(tempVec1)
}

/**
 * NOTE: Use this function alongwith XRCameraUpdatePendingTagComponent always
 * Aligns the XR camra rotation with the avatar's forward vector
 * @param entity
 * @param camera
 */
export const alignXRCameraRotationWithAvatar = (entity: Entity, camera: PerspectiveCamera | OrthographicCamera) => {
  const avatarTransform = getComponent(entity, TransformComponent)
  const camParentRot = camera.parent!.quaternion
  tempVec1.set(0, 0, 1).applyQuaternion(Engine.instance.currentWorld.camera.quaternion).setY(0).normalize()
  quat.setFromUnitVectors(tempVec2.set(0, 0, 1), tempVec1).invert()
  tempVec1.set(0, 0, -1).applyQuaternion(avatarTransform.rotation).setY(0).normalize()
  camParentRot.setFromUnitVectors(tempVec2.set(0, 0, 1), tempVec1).multiply(quat)
}

const moveAvatarController = (world: World, entity: Entity, displacement: any) => {
  const {
    fixedDelta,
    physics: { timeScale }
  } = world

  const timeStep = timeScale * fixedDelta
  const controller = getComponent(entity, AvatarControllerComponent)
  const filters = new PhysX.PxControllerFilters(controller.filterData, world.physics.defaultCCTQueryCallback, null!)

  const collisionFlags = controller.controller.move(
    displacement,
    0.001,
    timeStep,
    filters,
    world.physics.obstacleContext
  )

  controller.collisions = [
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_DOWN),
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_SIDES),
    collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_UP)
  ]
}

/**
 * Moves the avatar using camera displacement
 * @param world
 * @param entity
 * @param camera
 * @param lastCameraPos Out, last frame camera position
 * @returns
 */
export const moveXRAvatar = (
  world: World,
  entity: Entity,
  camera: PerspectiveCamera | OrthographicCamera,
  lastCameraPos: Vector3,
  avatarVelocity: Vector3
): void => {
  const cameraPosition = camera.position
  const avatarPosition = tempVec1
  getAvatarCameraPosition(entity, avatarCameraOffset, avatarPosition)

  if (avatarPosition.subVectors(avatarPosition, cameraPosition).lengthSq() > 0.1 || avatarVelocity.lengthSq() > 0) {
    lastCameraPos.subVectors(camera.position, camera.parent!.position)

    if (!hasComponent(entity, XRCameraUpdatePendingTagComponent)) {
      alignXRCameraPositionWithAvatar(entity, camera)
      addComponent(entity, XRCameraUpdatePendingTagComponent, {})
    }

    // Calculate new camera world position
    lastCameraPos.add(camera.parent!.position)
    return
  }

  avatarPosition.subVectors(cameraPosition, lastCameraPos)
  lastCameraPos.copy(cameraPosition)

  const displacement = {
    x: avatarPosition.x,
    y: 0,
    z: avatarPosition.z
  }

  const velocity = getComponent(entity, VelocityComponent)
  velocity.linear.setX(displacement.x)
  velocity.linear.setZ(displacement.z)

  moveAvatarController(world, entity, displacement)
}

/**
 * Teleports the avatar to new position
 * @param entity
 * @param newPosition
 */
export const teleportAvatar = (entity: Entity, newPosition: Vector3): void => {
  if (!hasComponent(entity, AvatarComponent)) {
    console.warn('Teleport avatar called on non-avatar entity')
    return
  }

  if (checkPositionIsValid(newPosition, false)) {
    const avatar = getComponent(entity, AvatarComponent)
    const controllerComponent = getComponent(entity, AvatarControllerComponent)
    newPosition.y = newPosition.y + avatar.avatarHalfHeight
    controllerComponent.controller.setPosition(newPosition)
  } else {
    console.log('invalid position', newPosition)
  }
}
