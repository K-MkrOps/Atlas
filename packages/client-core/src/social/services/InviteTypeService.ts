import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@hoostate/core'

import { InviteType } from '@atlasfoundation/common/src/interfaces/InviteType'

import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
const state = createState({
  inviteTypeData: {
    invitesType: [] as Array<InviteType>,
    skip: 0,
    limit: 5,
    total: 0
  }
})

store.receptors.push((action: InviteTypeActionType): any => {
  let newValues
  state.batch((s) => {
    switch (action.type) {
      case 'LOAD_INVITE_TYPE':
        newValues = action
        if (newValues.invitesType != null) {
          s.inviteTypeData.invitesType.merge([newValues.invitesType])
        }
        s.inviteTypeData.skip.set(newValues.skip)
        s.inviteTypeData.limit.set(newValues.limit)
        return s.inviteTypeData.total.set(newValues.total)
    }
  }, action.type)
})

export const accessInviteTypeState = () => state

export const useInviteTypeState = () => useState(state) as any as typeof state

//Service
export const InviteTypeService = {
  retrieveInvites: async () => {
    const dispatch = useDispatch()

    dispatch(InviteTypeAction.fetchingInvitesTypes())
    try {
      const inviteTypeResult = (await client.service('invite-type').find()) as Paginated<InviteType>
      dispatch(InviteTypeAction.retrievedInvitesTypes(inviteTypeResult))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

//Action
export const InviteTypeAction = {
  retrievedInvitesTypes: (inviteType: Paginated<InviteType>) => {
    return {
      type: 'LOAD_INVITE_TYPE' as const,
      total: inviteType.total,
      limit: inviteType.limit,
      invitesType: inviteType.data,
      skip: inviteType.skip
    }
  },
  fetchingInvitesTypes: () => {
    return {
      type: 'FETCHING_RECEIVED_INVITES_TYPES' as const
    }
  }
}

export type InviteTypeActionType = ReturnType<typeof InviteTypeAction[keyof typeof InviteTypeAction]>
