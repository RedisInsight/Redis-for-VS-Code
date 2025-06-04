import { isString } from 'lodash'
import { StorageItem } from 'uiSrc/constants'
import { localStorageService } from './storage'

export const migrateLocalStorageData = () => {
  migrateDelimiterTreeView()
}

const migrateDelimiterTreeView = () => {
  const treeViewDelimiter = localStorageService.get(StorageItem.treeViewDelimiter)

  if (treeViewDelimiter && isString(treeViewDelimiter)) {
    localStorageService.set(
      StorageItem.treeViewDelimiter,
      [treeViewDelimiter],
    )
  }
}
