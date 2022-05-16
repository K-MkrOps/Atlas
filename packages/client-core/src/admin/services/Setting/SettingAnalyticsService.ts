import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@hoostate/core'

import { SettingAnalytics } from '@atlasfoundation/common/src/interfaces/SettingAnalytics'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  analytics: [] as Array<SettingAnalytics>,
  updateNeeded: true
})

store.receptors.push((action: SettingAnalyticsActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SETTING_ANALYIS_DISPLAY':
        return s.merge({ analytics: action.settingAnalyticsResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessSettingAnalyticsState = () => state

export const useSettingAnalyticsState = () => useState(state) as any as typeof state

//Service
export const SettingAnalyticsService = {
  fetchSettingsAnalytics: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const analytics = (await client.service('analytics-setting').find()) as Paginated<SettingAnalytics>
      dispatch(SettingAnalyticsAction.fetchedAnalytics(analytics))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  }
}

//Action
export const SettingAnalyticsAction = {
  fetchedAnalytics: (settingAnalyticsResult: Paginated<SettingAnalytics>) => {
    return {
      type: 'SETTING_ANALYIS_DISPLAY' as const,
      settingAnalyticsResult: settingAnalyticsResult
    }
  }
}

export type SettingAnalyticsActionType = ReturnType<typeof SettingAnalyticsAction[keyof typeof SettingAnalyticsAction]>
