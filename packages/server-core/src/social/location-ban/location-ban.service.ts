// Initializes the `location-ban` service on dpath `/location-ban`
import { Application } from '../../../declarations'
import logger from '../../logger'
import { LocationBan } from './location-ban.class'
import locationBanDocs from './location-ban.docs'
import hooks from './location-ban.hooks'
import createModel from './location-ban.model'

// Add this service to the service type index
declare module '@atlas/common/declarations' {
  interface ServiceTypes {
    'location-ban': LocationBan
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   */
  const event = new LocationBan(options, app)
  event.docs = locationBanDocs
  app.use('location-ban', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   */
  const service = app.service('location-ban')

  service.hooks(hooks)

  service.publish('created', async (data, params): Promise<any> => {
    try {
      const targetIds = [data.userId]
      const user = await app.service('user').get(data.userId)
      const partyUser: any = await app.service('party-user').find({
        query: {
          partyId: user.partyId,
          userId: user.id
        }
      })
      if (partyUser.total > 0) {
        const { query, ...paramsCopy } = params as any
        paramsCopy.skipAuth = true
        await app.service('party-user').remove(partyUser.data[0].id, paramsCopy)
      }

      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            locationBan: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
    }
  })
}
