import { clearOutgoingActions } from '@atlasfoundation/hyperflux'

import { World } from '../../ecs/classes/World'
import { Network } from '../classes/Network'

const sendOutgoingActions = (world: World) => {
  const transport = Network.instance.getTransport('world')
  if (!transport) return

  try {
    transport.sendActions(world.store.actions.outgoing)
  } catch (e) {
    console.error(e)
  }

  clearOutgoingActions(world.store)

  return world
}

export default async function OutgoingActionSystem(world: World) {
  let lastTickSync = 0
  return () => {
    if (world.isHosting && world.fixedTick - lastTickSync > 60 * 60 * 2) {
      dispatchAction(world.store, NetworkWorldAction.timeSync({}))
      lastTickSync = world.fixedTick
    }
    sendOutgoingActions(world)
  }
}
