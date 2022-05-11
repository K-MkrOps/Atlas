import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserRole as UserRoleInterface } from '@atlas/common/src/interfaces/UserRole'

import { Application } from '../../../declarations'

export type UserRoleDataType = UserRoleInterface
/**
 * A class for User Role service
 *
 */
export class UserRole<T = UserRoleDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
