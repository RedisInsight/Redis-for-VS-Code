import { isNull } from 'lodash'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

export const isShowScanMore = (scanned: number, total: Nullable<number>, nextCursor?: string) =>
  isNull(total)
  || (scanned < total)
  || (total > SCAN_TREE_COUNT_DEFAULT)
  || nextCursor !== '0'

export const isDisableScanMore = (scanned: number = 0, total: Nullable<number>, nextCursor: string) =>
  (scanned >= total!) || (nextCursor === '0')
