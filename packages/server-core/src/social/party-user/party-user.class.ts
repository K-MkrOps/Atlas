import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { PartyUser as PartyUserDataType } from '@atlasfoundation/common/src/interfaces/PartyUser'

import { Application } from '../../../declarations'

/**
 * A class for Party user service
 *
 */
export class PartyUser<T = PartyUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
