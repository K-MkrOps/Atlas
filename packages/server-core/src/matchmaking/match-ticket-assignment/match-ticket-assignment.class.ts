import { BadRequest, NotFound } from '@feathersjs/errors'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { getTicketsAssignment } from '@atlas/matchmaking/src/functions'
import { OpenMatchTicketAssignment } from '@atlas/matchmaking/src/interfaces'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { emulate_getTicketsAssignment } from '../emulate'

interface Data {}

interface ServiceOptions {}

/**
 * A class for OpenMatch Tickets service
 *
 */
export class MatchTicketAssignment implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(params: Params): Promise<Data[]> {
    return []
  }

  async get(ticketId: unknown, params: Params): Promise<OpenMatchTicketAssignment> {
    if (typeof ticketId !== 'string' || ticketId.length === 0) {
      throw new BadRequest('Invalid ticket id, not empty string is expected')
    }

    let assignment: OpenMatchTicketAssignment
    try {
      if (config.server.matchmakerEmulationMode) {
        assignment = await emulate_getTicketsAssignment(this.app, ticketId, params['identity-provider'].userId)
      } else {
        assignment = await getTicketsAssignment(ticketId)
      }
    } catch (e) {
      // todo: handle other errors. like no connection, etc....
      throw new NotFound(e.message, e)
    }

    return assignment
  }

  async create(data: any, params: Params): Promise<Data> {
    return data
  }

  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    // not implemented for tickets
    return data
  }

  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    // not implemented for tickets
    return data
  }

  async remove(id: Id, params: Params): Promise<Data> {
    return { id }
  }
}
