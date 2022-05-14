import {
  Box3,
  Intersection,
  Layers,
  MathUtils,
  Object3D,
  Plane,
  Quaternion,
  Ray,
  Raycaster,
  Vector2,
  Vector3
} from 'three'

import { Engine } from '@atlasfoundation/engine/src/ecs/classes/Engine'
import { Entity } from '@atlasfoundation/engine/src/ecs/classes/Entity'
import { World } from '@atlasfoundation/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@atlasfoundation/engine/src/ecs/functions/EntityTreeFunctions'
import InfiniteGridHelper from '@atlasfoundation/engine/src/scene/classes/InfiniteGridHelper'
import TransformGizmo from '@atlasfoundation/engine/src/scene/classes/TransformGizmo'
import { Object3DComponent } from '@atlasfoundation/engine/src/scene/components/Object3DComponent'
import {
  SnapMode,
  TransformAxis,
  TransformAxisConstraints,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType
} from '@atlasfoundation/engine/src/scene/constants/transformConstants'
import { TransformSpace } from '@atlasfoundation/engine/src/scene/constants/transformConstants'

import { EditorCameraComponent, EditorCameraComponentType } from '../classes/EditorCameraComponent'
import { EditorControlComponent } from '../classes/EditorControlComponent'
import {
  EditorHistory,
  executeCommand,
  executeCommandWithHistory,
  executeCommandWithHistoryOnSelection,
  redoCommand,
  undoCommand
} from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { EditorActionSet, FlyActionSet } from '../controls/input-mappings'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { getIntersectingNodeOnScreen } from '../functions/getIntersectingNode'
import { getInput } from '../functions/parseInputActionMapping'
import { SceneState } from '../functions/sceneRenderFunctions'
import {
  setTransformMode,
  toggleSnapMode,
  toggleTransformPivot,
  toggleTransformSpace
} from '../functions/transformFunctions'
import { accessEditorHelperState } from '../services/EditorHelperState'
import { accessSelectionState } from '../services/SelectionServices'

const SELECT_SENSITIVITY = 0.001

/**
 */
export default async function EditorControlSystem(_: World) {
  const editorControlQuery = defineQuery([EditorControlComponent])
  const selectionState = accessSelectionState()
  const editorHelperState = accessEditorHelperState()

  const raycaster = new Raycaster()
  const raycasterResults: Intersection<Object3D>[] = []
  const raycastIgnoreLayers = new Layers()
  const box = new Box3()
  const inverseGizmoQuaternion = new Quaternion()
  const planeNormal = new Vector3()
  const planeIntersection = new Vector3()
  const transformPlane = new Plane()
  const centerViewportPosition = new Vector2()
  const ray = new Ray()
  const dragOffset = new Vector3()
  const dragVector = new Vector3()
  const initDragVector = new Vector3()
  const deltaDragVector = new Vector3()
  const translationVector = new Vector3()
  const constraintVector = new Vector3()
  const prevPos = new Vector3()
  const prevScale = new Vector3()
  const curScale = new Vector3()
  const scaleVector = new Vector3()
  const initRotationDrag = new Vector3()
  const normalizedInitRotationDrag = new Vector3()
  const normalizedCurRotationDrag = new Vector3()
  const curRotationDrag = new Vector3()
  const viewDirection = new Vector3()
  const selectStartPosition = new Vector2()
  let prevRotationAngle = 0

  let cameraComponent: EditorCameraComponentType
  let selectedEntities: Entity[]
  let selectedParentEntities: Entity[]
  let selectionCounter: number = 0
  let gizmoObj: TransformGizmo
  let transformMode: TransformModeType
  let transformPivot: TransformPivotType
  let transformSpace: TransformSpace
  let transformModeChanged = false
  let transformPivotChanged = false
  let transformSpaceChanged = false
  let dragging = false

  const findIntersectObjects = (object: Object3D, excludeObjects?: Object3D[], excludeLayers?: Layers): void => {
    if (
      (excludeObjects && excludeObjects.indexOf(object) !== -1) ||
      (excludeLayers && excludeLayers.test(object.layers)) ||
      !object.visible
    ) {
      return
    }

    raycaster.intersectObject(object, false, raycasterResults)

    for (let i = 0; i < object.children.length; i++) {
      findIntersectObjects(object.children[i], excludeObjects, excludeLayers)
    }
  }

  const getRaycastPosition = (coords: Vector2, target: Vector3, snapAmount: number = 0): void => {
    raycaster.setFromCamera(coords, Engine.instance.camera)
    raycasterResults.length = 0
    raycastIgnoreLayers.set(1)
    const os = selectionState.selectedParentEntities.value.map(
      (entity) => getComponent(entity, Object3DComponent).value
    )

    findIntersectObjects(Engine.instance.scene, os, raycastIgnoreLayers)
    findIntersectObjects(InfiniteGridHelper.instance)

    raycasterResults.sort((a, b) => a.distance - b.distance)
    if (raycasterResults[0] && raycasterResults[0].distance < 100) target.copy(raycasterResults[0].point)
    else raycaster.ray.at(10, target)

    if (snapAmount) {
      target.set(
        Math.round(target.x / snapAmount) * snapAmount,
        Math.round(target.y / snapAmount) * snapAmount,
        Math.round(target.z / snapAmount) * snapAmount
      )
    }
  }

  return () => {
    for (let _ of editorControlQuery()) {
      if (editorHelperState.isPlayModeEnabled.value) continue

      selectedParentEntities = selectionState.selectedParentEntities.value
      selectedEntities = selectionState.selectedEntities.value
      gizmoObj = getComponent(SceneState.gizmoEntity, Object3DComponent)?.value as TransformGizmo

      transformModeChanged = transformMode === editorHelperState.transformMode.value
      transformMode = editorHelperState.transformMode.value

      transformPivotChanged = transformPivot === editorHelperState.transformPivot.value
      transformPivot = editorHelperState.transformPivot.value

      transformSpaceChanged = transformSpace === editorHelperState.transformSpace.value
      transformSpace = editorHelperState.transformSpace.value

      if (!gizmoObj) continue

      if (selectedParentEntities.length === 0 || transformMode === TransformMode.Disabled) {
        gizmoObj.visible = false
      } else {
        const lastSelectedObj3d = getComponent(selectedEntities[selectedEntities.length - 1], Object3DComponent)?.value
        if (lastSelectedObj3d) {
          const isChanged =
            selectionCounter !== selectionState.selectionCounter.value ||
            transformModeChanged ||
            selectionState.transformPropertyChanged.value

          if (isChanged || transformPivotChanged) {
            if (transformPivot === TransformPivot.Selection) {
              lastSelectedObj3d.getWorldPosition(gizmoObj.position)
            } else {
              box.makeEmpty()

              for (let i = 0; i < selectedParentEntities.length; i++) {
                box.expandByObject(getComponent(selectedParentEntities[i], Object3DComponent).value)
              }

              box.getCenter(gizmoObj.position)
              if (transformPivot === TransformPivot.Bottom) {
                gizmoObj.position.y = box.min.y
              }
            }
          }

          if (isChanged || transformSpaceChanged) {
            if (transformSpace === TransformSpace.LocalSelection) {
              lastSelectedObj3d.getWorldQuaternion(gizmoObj.quaternion)
            } else {
              gizmoObj.rotation.set(0, 0, 0)
            }

            inverseGizmoQuaternion.copy(gizmoObj.quaternion).invert()
          }

          if ((transformModeChanged || transformSpaceChanged) && transformMode === TransformMode.Scale) {
            gizmoObj.setLocalScaleHandlesVisible(transformSpace !== TransformSpace.World)
          }

          gizmoObj.visible = true
        }
      }

      const cursorPosition = getInput(EditorActionSet.cursorPosition)
      const isGrabbing = transformMode === TransformMode.Grab || transformMode === TransformMode.Placement
      const selectStartAndNoGrabbing =
        getInput(EditorActionSet.selectStart) && !isGrabbing && !editorHelperState.isFlyModeEnabled.value

      if (selectStartAndNoGrabbing) {
        selectStartPosition.copy(getInput(EditorActionSet.selectStartPosition))

        if (gizmoObj.activeControls) {
          gizmoObj.selectAxisWithRaycaster(selectStartPosition)

          if (gizmoObj.selectedAxis) {
            planeNormal.copy(gizmoObj.selectedPlaneNormal!).applyQuaternion(gizmoObj.quaternion).normalize()
            transformPlane.setFromNormalAndCoplanarPoint(planeNormal, gizmoObj.position)
            dragging = true
          } else {
            dragging = false
          }
        }
      } else if (gizmoObj.activeControls && !dragging) {
        gizmoObj.highlightHoveredAxis(cursorPosition)
      }

      const modifier = getInput(EditorActionSet.modifier)
      const shouldSnap = (editorHelperState.snapMode.value === SnapMode.Grid) === !modifier
      const selectEnd = getInput(EditorActionSet.selectEnd)

      if (dragging || isGrabbing) {
        let constraint
        if (isGrabbing) {
          getRaycastPosition(
            editorHelperState.isFlyModeEnabled.value ? centerViewportPosition : cursorPosition,
            planeIntersection,
            shouldSnap ? editorHelperState.translationSnap.value : 0
          )
          constraint = TransformAxisConstraints.XYZ
        } else {
          ray.origin.setFromMatrixPosition(Engine.instance.camera.matrixWorld)
          ray.direction.set(cursorPosition.x, cursorPosition.y, 0).unproject(Engine.instance.camera).sub(ray.origin)
          ray.intersectPlane(transformPlane, planeIntersection)
          constraint = TransformAxisConstraints[gizmoObj.selectedAxis!]
        }

        if (!constraint) {
          console.warn(
            `Axis Constraint is undefined.
            transformAxis was ${gizmoObj.selectedAxis}.
            transformMode was ${transformMode}.
            dragging was ${dragging}.`
          )
        }

        if (selectStartAndNoGrabbing) dragOffset.subVectors(gizmoObj.position, planeIntersection)
        else if (isGrabbing) dragOffset.set(0, 0, 0)

        planeIntersection.add(dragOffset)

        if (
          transformMode === TransformMode.Translate ||
          transformMode === TransformMode.Grab ||
          transformMode === TransformMode.Placement
        ) {
          translationVector
            .subVectors(planeIntersection, gizmoObj.position)
            .applyQuaternion(inverseGizmoQuaternion)
            .multiply(constraint)
          translationVector.applyQuaternion(gizmoObj.quaternion)
          gizmoObj.position.add(translationVector)
          if (shouldSnap) {
            prevPos.copy(gizmoObj.position)
            constraintVector.copy(constraint).applyQuaternion(gizmoObj.quaternion)

            const snapValue = editorHelperState.translationSnap.value
            gizmoObj.position.set(
              constraintVector.x !== 0 ? Math.round(gizmoObj.position.x / snapValue) * snapValue : gizmoObj.position.x,
              constraintVector.y !== 0 ? Math.round(gizmoObj.position.y / snapValue) * snapValue : gizmoObj.position.y,
              constraintVector.z !== 0 ? Math.round(gizmoObj.position.z / snapValue) * snapValue : gizmoObj.position.z
            )

            translationVector.set(
              translationVector.x + gizmoObj.position.x - prevPos.x,
              translationVector.y + gizmoObj.position.y - prevPos.y,
              translationVector.z + gizmoObj.position.z - prevPos.z
            )
          }

          executeCommandWithHistoryOnSelection(EditorCommands.POSITION, {
            positions: translationVector,
            space: transformSpace,
            addToPosition: true
          })

          if (isGrabbing && transformMode === TransformMode.Grab) {
            EditorHistory.grabCheckPoint = selectedEntities ? selectedEntities[0] : (0 as Entity)
          }
        } else if (transformMode === TransformMode.Rotate) {
          if (selectStartAndNoGrabbing) {
            initRotationDrag.subVectors(planeIntersection, dragOffset).sub(gizmoObj.position)
            prevRotationAngle = 0
          }
          curRotationDrag.subVectors(planeIntersection, dragOffset).sub(gizmoObj.position)
          normalizedInitRotationDrag.copy(initRotationDrag).normalize()
          normalizedCurRotationDrag.copy(curRotationDrag).normalize()
          let rotationAngle = curRotationDrag.angleTo(initRotationDrag)
          rotationAngle *= normalizedInitRotationDrag.cross(normalizedCurRotationDrag).dot(planeNormal) > 0 ? 1 : -1

          if (shouldSnap) {
            const rotationSnapAngle = MathUtils.DEG2RAD * editorHelperState.rotationSnap.value
            rotationAngle = Math.round(rotationAngle / rotationSnapAngle) * rotationSnapAngle
          }

          const relativeRotationAngle = rotationAngle - prevRotationAngle
          prevRotationAngle = rotationAngle

          executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
            pivot: gizmoObj.position,
            axis: planeNormal,
            angle: relativeRotationAngle
          })

          const selectedAxisInfo = gizmoObj.selectedAxisObj?.axisInfo!
          if (selectStartAndNoGrabbing) {
            selectedAxisInfo.startMarker!.visible = true
            selectedAxisInfo.endMarker!.visible = true
            if (transformSpace !== TransformSpace.World) {
              selectedAxisInfo.startMarkerLocal!.position.copy(gizmoObj.position)
              selectedAxisInfo.startMarkerLocal!.quaternion.copy(gizmoObj.quaternion)
              selectedAxisInfo.startMarkerLocal!.scale.copy(gizmoObj.scale)
              Engine.instance.scene.add(selectedAxisInfo.startMarkerLocal!)
            }
          }

          if (transformSpace === TransformSpace.World) {
            if (!selectedAxisInfo.rotationTarget) {
              throw new Error(
                `Couldn't rotate object due to an unknown error. The selected axis is ${
                  (gizmoObj as any).selectedAxis.name
                } The selected axis info is: ${JSON.stringify(selectedAxisInfo)}`
              )
            }
            selectedAxisInfo.rotationTarget.rotateOnAxis(selectedAxisInfo.planeNormal, relativeRotationAngle)
          } else {
            gizmoObj.rotateOnAxis(selectedAxisInfo.planeNormal, relativeRotationAngle)
          }

          if (selectEnd) {
            selectedAxisInfo.startMarker!.visible = false
            selectedAxisInfo.endMarker!.visible = false
            selectedAxisInfo.rotationTarget!.rotation.set(0, 0, 0)
            if (transformSpace !== TransformSpace.World) {
              const startMarkerLocal = selectedAxisInfo.startMarkerLocal
              if (startMarkerLocal) Engine.instance.scene.remove(startMarkerLocal)
            }
          }
        } else if (transformMode === TransformMode.Scale) {
          dragVector.copy(planeIntersection).applyQuaternion(inverseGizmoQuaternion).multiply(constraint)

          if (selectStartAndNoGrabbing) {
            initDragVector.copy(dragVector)
            prevScale.set(1, 1, 1)
          }
          deltaDragVector.subVectors(dragVector, initDragVector)
          deltaDragVector.multiply(constraint)

          let scaleFactor =
            gizmoObj.selectedAxis === TransformAxis.XYZ
              ? 1 +
                Engine.instance.camera
                  .getWorldDirection(viewDirection)
                  .applyQuaternion(gizmoObj.quaternion)
                  .dot(deltaDragVector)
              : 1 + constraint.dot(deltaDragVector)

          curScale.set(
            constraint.x === 0 ? 1 : scaleFactor,
            constraint.y === 0 ? 1 : scaleFactor,
            constraint.z === 0 ? 1 : scaleFactor
          )

          if (shouldSnap) {
            curScale
              .divideScalar(editorHelperState.scaleSnap.value)
              .round()
              .multiplyScalar(editorHelperState.scaleSnap.value)
          }

          curScale.set(
            curScale.x <= 0 ? Number.EPSILON : curScale.x,
            curScale.y <= 0 ? Number.EPSILON : curScale.y,
            curScale.z <= 0 ? Number.EPSILON : curScale.z
          )
          scaleVector.copy(curScale).divide(prevScale)
          prevScale.copy(curScale)

          executeCommandWithHistoryOnSelection(EditorCommands.SCALE, {
            scales: scaleVector,
            space: transformSpace
          })
        }
      }

      selectionCounter = selectionState.selectionCounter.value
      cameraComponent = getComponent(Engine.instance.activeCameraEntity, EditorCameraComponent)
      const shift = getInput(EditorActionSet.shift)

      if (selectEnd) {
        const boost = getInput(FlyActionSet.boost)
        if (transformMode === TransformMode.Grab) {
          setTransformMode(shift || boost ? TransformMode.Placement : editorHelperState.transformModeOnCancel.value)
        } else if (transformMode === TransformMode.Placement) {
          if (shift || boost) {
            executeCommandWithHistoryOnSelection(EditorCommands.DUPLICATE_OBJECTS, {
              isObjectSelected: false
            })
          } else {
            setTransformMode(editorHelperState.transformModeOnCancel.value)
          }
        } else {
          const selectEndPosition = getInput(EditorActionSet.selectEndPosition)
          if (selectStartPosition.distanceTo(selectEndPosition) < SELECT_SENSITIVITY) {
            const result = getIntersectingNodeOnScreen(raycaster, selectEndPosition)
            if (result) {
              if (result.node) {
                executeCommandWithHistory(
                  shift ? EditorCommands.TOGGLE_SELECTION : EditorCommands.REPLACE_SELECTION,
                  result.node
                )
              }
            } else if (!shift) {
              executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
            }
          }
          SceneState.transformGizmo.deselectAxis()
          dragging = false
        }
      }
      if (getInput(EditorActionSet.rotateLeft)) {
        executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
          pivot: SceneState.transformGizmo.position,
          axis: new Vector3(0, 1, 0),
          angle: editorHelperState.rotationSnap.value * MathUtils.DEG2RAD
        })
      } else if (getInput(EditorActionSet.rotateRight)) {
        executeCommandWithHistoryOnSelection(EditorCommands.ROTATE_AROUND, {
          pivot: SceneState.transformGizmo.position,
          axis: new Vector3(0, 1, 0),
          angle: -editorHelperState.rotationSnap.value * MathUtils.DEG2RAD
        })
      } else if (getInput(EditorActionSet.grab)) {
        if (transformMode === TransformMode.Grab || transformMode === TransformMode.Placement) {
          cancelGrabOrPlacement()
          executeCommand(EditorCommands.REPLACE_SELECTION, [])
        }
        if (selectedEntities.length > 0) {
          setTransformMode(TransformMode.Grab)
        }
      } else if (getInput(EditorActionSet.cancel)) {
        cancelGrabOrPlacement()
        executeCommand(EditorCommands.REPLACE_SELECTION, [])
      } else if (getInput(EditorActionSet.focusSelection)) {
        cameraComponent.focusedObjects = getEntityNodeArrayFromEntities(selectedEntities)
        cameraComponent.refocus = true
      } else if (getInput(EditorActionSet.setTranslateMode)) {
        setTransformMode(TransformMode.Translate)
      } else if (getInput(EditorActionSet.setRotateMode)) {
        setTransformMode(TransformMode.Rotate)
      } else if (getInput(EditorActionSet.setScaleMode)) {
        setTransformMode(TransformMode.Scale)
      } else if (getInput(EditorActionSet.toggleSnapMode)) {
        toggleSnapMode()
      } else if (getInput(EditorActionSet.toggleTransformPivot)) {
        toggleTransformPivot()
      } else if (getInput(EditorActionSet.toggleTransformSpace)) {
        toggleTransformSpace()
      } else if (getInput(EditorActionSet.incrementGridHeight)) {
        InfiniteGridHelper.instance.incrementGridHeight()
      } else if (getInput(EditorActionSet.decrementGridHeight)) {
        InfiniteGridHelper.instance.decrementGridHeight()
      } else if (getInput(EditorActionSet.undo)) {
        undoCommand()
      } else if (getInput(EditorActionSet.redo)) {
        redoCommand()
      } else if (getInput(EditorActionSet.deleteSelected)) {
        executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS, {
          deselectObject: true
        })
      }

      if (editorHelperState.isFlyModeEnabled.value) continue

      const selecting = getInput(EditorActionSet.selecting)
      const zoomDelta = getInput(EditorActionSet.zoomDelta)
      const focusPosition = getInput(EditorActionSet.focusPosition)
      const orbiting = selecting && !dragging

      if (zoomDelta !== 0) {
        cameraComponent.zoomDelta = zoomDelta
      } else if (focusPosition) {
        raycasterResults.length = 0
        const result = getIntersectingNodeOnScreen(raycaster, focusPosition, raycasterResults)
        if (result && result.node) {
          cameraComponent.focusedObjects = [result.node]
          cameraComponent.refocus = true
        }
      } else if (getInput(EditorActionSet.panning)) {
        cameraComponent.isPanning = true
        cameraComponent.cursorDeltaX = getInput(EditorActionSet.cursorDeltaX)
        cameraComponent.cursorDeltaY = getInput(EditorActionSet.cursorDeltaY)
      } else if (orbiting) {
        cameraComponent.isOrbiting = true
        cameraComponent.cursorDeltaX = getInput(EditorActionSet.cursorDeltaX)
        cameraComponent.cursorDeltaY = getInput(EditorActionSet.cursorDeltaY)
      }
    }
  }
}
