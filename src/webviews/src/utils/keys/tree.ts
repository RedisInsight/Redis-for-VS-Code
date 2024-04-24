import { isNull } from 'lodash'
import { Nullable } from 'uiSrc/interfaces'

export const isShowScanMore = (scanned?: number, total?: Nullable<number>) =>
  scanned || isNull(total)
