import isGlob from 'is-glob'
import { get } from 'lodash'

import { store } from 'uiSrc/store'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { ITelemetrySendEvent, MatchType } from './interfaces'

export const sendEventTelemetry = async ({ event, eventData = {} }: ITelemetrySendEvent) => {
  try {
    const isAnalyticsGranted = checkIsAnalyticsGranted()
    if (!isAnalyticsGranted) {
      return
    }
    await apiService.post(`${ApiEndpoints.ANALYTICS_SEND_EVENT}`, { event, eventData })
  } catch (e) {
    // continue regardless of error
  }
}

export const getMatchType = (match: string): MatchType => (
  !isGlob(match, { strict: false })
    ? MatchType.EXACT_VALUE_NAME
    : MatchType.PATTERN
)

// Check is user give access to collect his events
export const checkIsAnalyticsGranted = (): boolean =>
  !!get(store.getState(), 'user.settings.config.agreements.analytics', false)
