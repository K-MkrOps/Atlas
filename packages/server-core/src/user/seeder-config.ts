import { ServicesSeedConfig } from '@atlas/common/src/interfaces/ServicesSeedConfig'

import { userRelationshipTypeSeed } from './user-relationship-type/user-relationship-type.seed'
import { userRoleSeed } from './user-role/user-role.seed'

export const userSeeds: Array<ServicesSeedConfig> = [userRoleSeed, userRelationshipTypeSeed]

export default userSeeds
