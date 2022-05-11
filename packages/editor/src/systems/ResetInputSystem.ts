import { World } from '@atlas/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'

import { InputComponent } from '../classes/InputComponent'
import { ActionKey } from '../controls/input-mappings'

/**
 */
export default async function ResetInputSystem(_: World) {
  const inputQuery = defineQuery([InputComponent])
  return () => {
    for (const entity of inputQuery()) {
      const inputComponent = getComponent(entity, InputComponent)
      inputComponent.resetKeys?.forEach((key: ActionKey) => {
        const actionState = inputComponent.actionState[key]
        const initialActionState = inputComponent.defaultState[key]

        if (typeof actionState === 'object' && typeof initialActionState === 'object') {
          inputComponent.actionState[key] = Object.assign(inputComponent.actionState[key] ?? {}, initialActionState)
        } else {
          inputComponent.actionState[key] = initialActionState
        }
      })
    }
  }
}
