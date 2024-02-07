import { ApiEndpoints, StorageItem } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'
import { sessionStorageService } from 'uiSrc/services'

export const getUrl = (...path: string[]) => {
  const databaseId = sessionStorageService.get(StorageItem.databaseId)

  return (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
}

export const getUrlWithId = (databaseId: Nullable<string>, ...path: string[]) =>
  (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
