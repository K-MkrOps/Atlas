import { NullableId, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Sequelize, Transaction } from 'sequelize'

import { UserRelationshipInterface } from '@atlas/common/src/dbmodels/UserRelationship'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { resolveModelData } from '../../util/model-resolver'

export type UserRelationshipDataType = UserRelationshipInterface
/**
 * A class for User Relationship service
 *
 */
export class UserRelationship<T = UserRelationshipDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async findAll(params?: Params): Promise<any> {
    if (!params) params = {}
    const UserRelationshipModel = this.getModel(params)
    const UserRelationshipTypeService = this.app.service('user-relationship-type')
    const userRelationshipTypes = ((await UserRelationshipTypeService.find()) as any).data

    const userId = params.query?.userId
    const result = {}

    for (const userRelationType of userRelationshipTypes) {
      const userRelations = await UserRelationshipModel.findAll({
        where: {
          userId,
          type: userRelationType.type
        },
        attributes: ['relatedUserId'],
        raw: false
      })

      const resolvedData: any[] = []
      for (const userRelation of userRelations) {
        const userData = resolveModelData(await userRelation.getRelatedUser())
        // add second relation type
        const inverseRelationType = resolveModelData(
          await UserRelationshipModel.findOne({
            where: {
              userId: userRelation.relatedUserId,
              relatedUserId: userId
            }
          })
        )

        if (inverseRelationType) {
          Object.assign(userData, { inverseRelationType: inverseRelationType.type })
        }

        Object.assign(userData, { relationType: userRelationType.type })

        resolvedData.push(userData)
      }

      Object.assign(result, { [userRelationType.type]: resolvedData })
    }

    Object.assign(result, { userId })
    return result
  }

  async create(data: any, params?: Params): Promise<T> {
    if (!params) params = {}
    const loggedInUserEntity: string = config.authentication.entity

    const userId = data.userId || params[loggedInUserEntity].userId
    const { relatedUserId, userRelationshipType } = data
    const UserRelationshipModel = this.getModel(params)
    let result: any

    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      await UserRelationshipModel.create(
        {
          userId: userId,
          relatedUserId: relatedUserId,
          userRelationshipType: userRelationshipType
        },
        {
          transaction: trans
        }
      )

      result = await UserRelationshipModel.create(
        {
          userId: relatedUserId,
          relatedUserId: userId,
          userRelationshipType: userRelationshipType === 'blocking' ? 'blocked' : 'requested'
        },
        {
          transaction: trans
        }
      )
    })

    return result
  }

  async patch(id: NullableId, data: any, params?: Params): Promise<T> {
    if (!params) params = {}
    const { userRelationshipType } = data
    const UserRelationshipModel = this.getModel(params)

    await UserRelationshipModel.update(
      {
        userRelationshipType: userRelationshipType
      },
      {
        where: {
          id: id
        }
      }
    )

    return UserRelationshipModel.findOne({
      where: {
        id: id
      }
    })
  }

  async remove(id: NullableId, params?: Params): Promise<T> {
    if (!params) params = {}
    const loggedInUserEntity: string = config.authentication.entity

    const authUser = params[loggedInUserEntity]
    const userId = authUser.userId
    const UserRelationshipModel = this.getModel(params)

    const relationship = await UserRelationshipModel.findOne({
      where: {
        userId: userId,
        relatedUserId: id
      }
    })
    await UserRelationshipModel.destroy({
      where: Sequelize.literal(
        `(userId='${userId as string}' AND relatedUserId='${id as string}') OR 
             (userId='${id as string}' AND relatedUserId='${userId as string}')`
      )
    })

    return relationship
  }
}
