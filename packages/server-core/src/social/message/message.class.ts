import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { Message as MessageInterface } from '@atlasfoundation/common/src/interfaces/Message'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { UserDataType } from '../../user/user/user.class'

export type MessageDataType = MessageInterface

export class Message<T = MessageDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * A function which is used to create a message
   *
   * @param data for new message
   * @param params contain user info
   * @returns {@Object} created message
   */
  async create(data: any, params?: Params): Promise<T> {
    let channel, channelId
    let userIdList: any[] = []
    const loggedInUser = params!.user as UserDataType
    const userId = loggedInUser?.id
    const targetObjectId = data.targetObjectId
    const targetObjectType = data.targetObjectType
    const channelModel = this.app.service('channel').Model
    logger.info(data)

    if (targetObjectType === 'user') {
      const targetUser = await this.app.service('user').get(targetObjectId)
      if (targetUser == null) {
        throw new BadRequest('Invalid target user ID')
      }
      channel = await channelModel.findOne({
        where: {
          [Op.or]: [
            {
              userId1: userId,
              userId2: targetObjectId
            },
            {
              userId2: userId,
              userId1: targetObjectId
            }
          ]
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'user',
          userId1: userId,
          userId2: targetObjectId
        })
      }
      channelId = channel.id
      userIdList = [userId, targetObjectId]
    } else if (targetObjectType === 'group') {
      const targetGroup = await this.app.service('group').get(targetObjectId)
      if (targetGroup == null) {
        throw new BadRequest('Invalid target group ID')
      }
      channel = await channelModel.findOne({
        where: {
          groupId: targetObjectId
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'group',
          groupId: targetObjectId
        })
      }
      channelId = channel.id
      const groupUsers = await this.app.service('group-user').find({
        query: {
          groupId: targetObjectId
        }
      })
      userIdList = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
    } else if (targetObjectType === 'party') {
      const targetParty = await this.app.service('party').get(targetObjectId, null!)
      if (targetParty == null) {
        throw new BadRequest('Invalid target party ID')
      }
      channel = await channelModel.findOne({
        where: {
          partyId: targetObjectId
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'party',
          partyId: targetObjectId
        })
      }
      channelId = channel.id
      const partyUsers = await this.app.service('party-user').find({
        query: {
          partyId: targetObjectId
        }
      })
      userIdList = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
    } else if (targetObjectType === 'instance') {
      const targetInstance = await this.app.service('instance').get(targetObjectId)
      if (targetInstance == null) {
        throw new BadRequest('Invalid target instance ID')
      }
      channel = await channelModel.findOne({
        where: {
          instanceId: targetObjectId
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'instance',
          instanceId: targetObjectId
        })
      }
      channelId = channel.id
      const instanceUsers = await this.app.service('user').find({
        query: {
          $limit: 1000,
          instanceId: targetObjectId,
          action: 'layer-users'
        }
      })
      userIdList = (instanceUsers as any).data.map((instanceUser) => {
        return instanceUser.id
      })
    }

    const messageData: any = {
      senderId: userId,
      channelId: channelId,
      text: data.text
    }
    const newMessage: any = await super.create({ ...messageData })

    await Promise.all(
      userIdList.map((mappedUserId: string) => {
        return this.app.service('message-status').create({
          userId: mappedUserId,
          messageId: newMessage.id,
          status: userId === mappedUserId ? 'read' : 'unread'
        })
      })
    )

    await this.app.service('channel').patch(channelId, {
      channelType: channel.channelType
    })

    return newMessage
  }
}
