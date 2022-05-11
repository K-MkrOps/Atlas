import { isEmpty } from 'lodash'

import { dispatchAction } from '@atlas/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineService'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { ErrorComponent } from '../components/ErrorComponent'

export const addError = (entity: Entity, key: string, error: any) => {
  console.error('[addError]:', entity, key, error)
  const errorComponent = getComponent(entity, ErrorComponent) ?? addComponent(entity, ErrorComponent, {})
  errorComponent[key] = error
  dispatchAction(Engine.instance.store, EngineActions.updateEntityError({ entity }))
}

export const removeError = (entity: Entity, key: string) => {
  const errorComponent = getComponent(entity, ErrorComponent)

  if (!errorComponent) return
  delete errorComponent[key]

  if (isEmpty(errorComponent)) {
    removeComponent(entity, ErrorComponent)
    dispatchAction(Engine.instance.store, EngineActions.updateEntityError({ entity, isResolved: true }))
  } else {
    dispatchAction(Engine.instance.store, EngineActions.updateEntityError({ entity }))
  }
}
