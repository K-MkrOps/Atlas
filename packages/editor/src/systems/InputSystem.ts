import { World } from '@atlas/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'

import { InputComponent } from '../classes/InputComponent'

/**
 */
export default async function InputSystem(_: World) {
  const inputQuery = defineQuery([InputComponent])
  return () => {
    for (const entity of inputQuery()) {
      const inputComponent = getComponent(entity, InputComponent)
      const computed = inputComponent.activeMapping?.computed

      if (!computed) return

      for (let i = 0; i < computed.length; i++) {
        inputComponent.actionState[computed[i].action] = computed[i].transform()
      }
    }
  }
}
