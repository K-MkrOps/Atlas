import { WebContainer3D, WebLayer3D, WebLayerManager } from '@etherealjs/web-layer/three'
import { State } from '@hookstate/core'
import React from 'react'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { XRUIComponent } from '../components/XRUIComponent'
import { XRUIStateContext } from '../XRUIStateContext'

let depsLoaded: Promise<[typeof import('@etherealjs/web-layer/three'), typeof import('react-dom')]>

async function createWebContainer<S extends State<any> | null>(
  UI: React.FC,
  state: S,
  options: import('@etherealjs/web-layer/three').WebContainer3DOptions
) {
  const [Ethereal, ReactDOM] = await (depsLoaded =
    depsLoaded || Promise.all([import('@etherealjs/web-layer/three'), import('react-dom')]))

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UI.name

  ReactDOM.render(
    //@ts-ignore
    <XRUIStateContext.Provider value={state}>
      <UI />
    </XRUIStateContext.Provider>,
    containerElement
  )

  options.autoRefresh = options.autoRefresh ?? true
  return new Ethereal.WebContainer3D(containerElement, options)
}

export function createXRUI<S extends State<any> | null>(UIFunc: React.FC, state = null as S): XRUI<S> {
  const entity = createEntity()

  const container = new Promise<WebContainer3D>(async (resolve, reject) => {
    const container = await createWebContainer(UIFunc, state, {
      manager: WebLayerManager.instance
    })

    container.raycaster.layers.enableAll()

    // Make sure entity still exists, since we are adding these components asynchronously,
    // and bad things might happen if we add these components after entity has been removed
    // TODO: revise this pattern after refactor
    if (!Engine.instance.currentWorld.entityQuery().includes(entity)) {
      console.warn('XRUI layer initialized after entity removed from world')
      container.rootLayer.dispose()
      return reject()
    }

    addComponent(entity, Object3DComponent, { value: container })
    setObjectLayers(container, ObjectLayers.UI)
    addComponent(entity, XRUIComponent, { container: container })
    addComponent(entity, VisibleComponent, {})

    resolve(container)
  })

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: Promise<WebContainer3D>
}
