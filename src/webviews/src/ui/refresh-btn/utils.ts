import * as l10n from '@vscode/l10n'
import { Nullable } from 'uiSrc/interfaces'
import { truncateNumberToFirstUnit } from 'uiSrc/utils'

export const NOW = l10n.t('now')
export const LESS_THAN_MINUTE = l10n.t('< 1 min')
export const MINUTE = 60
export const DURATION_FIRST_REFRESH_TIME = 5
export const TIMEOUT_TO_UPDATE_REFRESH_TIME = 1_000 * MINUTE // once a minute

export const getLastRefreshDelta = (time: Nullable<number>) => (Date.now() - (time || 0)) / 1_000

export const getTextByRefreshTime = (delta: number, lastRefreshTime: number) => {
  let text = ''

  if (delta > MINUTE) {
    text = truncateNumberToFirstUnit((Date.now() - (lastRefreshTime || 0)) / 1_000)
  }
  if (delta < MINUTE) {
    text = LESS_THAN_MINUTE
  }
  if (delta < DURATION_FIRST_REFRESH_TIME) {
    text = NOW
  }

  return text
}
