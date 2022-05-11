import { store } from '@atlas/client-core/src/store'
import { EntityTreeNode } from '@atlas/engine/src/ecs/classes/EntityTree'
import { addComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@atlas/engine/src/ecs/functions/EntityTreeFunctions'
import { SelectTagComponent } from '@atlas/engine/src/scene/components/SelectTagComponent'

import { executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export default class AddToSelectionCommand extends Command {
  constructor(objects: EntityTreeNode[], params: CommandParams) {
    super(objects, params)

    if (this.keepHistory) this.oldSelection = accessSelectionState().selectedEntities.value.slice(0)
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const selectedEntities = accessSelectionState().selectedEntities.value.slice(0)

    for (let i = 0; i < this.affectedObjects.length; i++) {
      const object = this.affectedObjects[i]
      if (selectedEntities.includes(object.entity)) continue

      addComponent(object.entity, SelectTagComponent, {})
      selectedEntities.push(object.entity)
    }

    store.dispatch(SelectionAction.updateSelection(selectedEntities))

    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldSelection) return
    executeCommand(EditorCommands.REPLACE_SELECTION, getEntityNodeArrayFromEntities(this.oldSelection))
  }

  toString() {
    return `SelectMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      updateOutlinePassSelection()
    }
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent) {
      cancelGrabOrPlacement()
      store.dispatch(SelectionAction.changedBeforeSelection())
    }
  }
}
