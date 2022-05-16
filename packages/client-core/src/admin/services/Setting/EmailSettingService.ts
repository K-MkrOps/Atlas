import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@hoostate/core'

import { EmailSetting, PatchEmailSetting } from '@atlasfoundation/common/src/interfaces/EmailSetting'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  email: [] as Array<EmailSetting>,
  updateNeeded: true
})

store.receptors.push((action: EmailSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'EMAIL_SETTING_DISPLAY':
        return s.merge({ email: action.emailSettingResult.data, updateNeeded: false })
      case 'EMAIL_SETTING_PATCHED':
        return s.updateNeeded.set(true)
    }
  }, action.type)
})

export const accessEmailSettingState = () => state

export const useEmailSettingState = () => useState(state) as any as typeof state

//Service
export const EmailSettingService = {
  fetchedEmailSettings: async (inDec?: 'increment' | 'dcrement') => {
    const dispatch = useDispatch()
    try {
      const emailSettings = (await client.service('email-setting').find()) as Paginated<EmailSetting>
      dispatch(EmailSettingAction.fetchedEmail(emailSettings))
    } catch (error) {
      console.log(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  },
  patchEmailSetting: async (data: PatchEmailSetting, id: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('email-setting').patch(id, data)
      dispatch(EmailSettingAction.emailSettingPatched())
    } catch (err) {
      AlertService.dispatchAlertError(err.message)
    }
  }
}

//Action
export const EmailSettingAction = {
  fetchedEmail: (emailSettingResult: Paginated<EmailSetting>) => {
    return {
      type: 'EMAIL_SETTING_DISPLAY' as const,
      emailSettingResult: emailSettingResult
    }
  },
  emailSettingPatched: () => {
    return {
      type: 'EMAIL_SETTING_PATCHED' as const
    }
  }
}

export type EmailSettingActionType = ReturnType<typeof EmailSettingAction[keyof typeof EmailSettingAction]>
