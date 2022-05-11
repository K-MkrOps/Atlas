import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import Sequelize, { Op } from 'sequelize'

import { Instance as InstanceInterface } from '@atlas/common/src/interfaces/Instance'

import { Application } from '../../../declarations'

export type InstanceDataType = InstanceInterface

/**
 * A class for Intance service
 *
 */
export class Instance<T = InstanceDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
  /**
   * A method which searches for instances
   *
   * @param params of query with an acton or user role
   * @returns user object
   */
  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const action = params?.query?.action
    const search = params?.query?.search
    const skip = params?.query?.$skip ? params.query.$skip : 0
    const limit = params?.query?.$limit ? params.query.$limit : 10
    const sort = params?.query?.$sort
    if (action === 'admin') {
      //TODO: uncomment here
      // const loggedInUser = params.user as UserDataType
      // const user = await super.get(loggedInUser.userId);
      // console.log(user);
      // if (user.userRole !== 'admin') throw new Forbidden ('Must be system admin to execute this action');
      let ip = {}
      let name = {}
      if (!isNaN(search)) {
        ip = search ? { ipAddress: { [Op.like]: `%${search}%` } } : {}
      } else {
        name = search ? { name: { [Op.like]: `%${search}%` } } : {}
      }
      const order: any[] = []
      if (sort != null)
        Object.keys(sort).forEach((name, val) => {
          if (name === 'locationId') {
            order.push([Sequelize.literal('`location.name`'), sort[name] === 0 ? 'DESC' : 'ASC'])
          } else {
            order.push([name, sort[name] === 0 ? 'DESC' : 'ASC'])
          }
        })
      const foundLocation = await this.app.service('instance').Model.findAndCountAll({
        offset: skip,
        limit: limit,
        include: {
          model: this.app.service('location').Model,
          required: true,
          where: { ...name }
        },
        nest: false,
        where: { ended: false, ...ip }
      })

      return {
        skip: skip,
        limit: limit,
        total: foundLocation.count,
        data: foundLocation.rows
      }
    } else {
      return super.find(params)
    }
  }
}
