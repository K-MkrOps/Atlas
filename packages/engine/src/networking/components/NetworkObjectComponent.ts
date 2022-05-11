import { Types } from 'bitecs'

import { NetworkId } from '@atlas/common/src/interfaces/NetworkId'
import { UserId } from '@atlas/common/src/interfaces/UserId'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type NetworkObjectComponentType = {
  /** The user who owns this object. */
  ownerId: UserId
  /** The network id for this object (this id is only unique per owner) */
  networkId: NetworkId
  /** All network objects need to be a registered prefab. */
  prefab: string
  /** The parameters by which the prefab was created */
  parameters: any
}

const SCHEMA = {
  networkId: Types.ui32
}

export const NetworkObjectComponent = createMappedComponent<NetworkObjectComponentType, typeof SCHEMA>(
  'NetworkObjectComponent',
  SCHEMA
)
