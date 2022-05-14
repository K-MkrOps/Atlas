import { applyIncomingActions } from '@atlasfoundation/hyperflux'

export default async function IncomingActionSystem(world) {
  return () => {
    applyIncomingActions(world.store)
  }
}
