import { applyIncomingActions } from '@atlas/hyperflux'

export default async function IncomingActionSystem(world) {
  return () => {
    applyIncomingActions(world.store)
  }
}
