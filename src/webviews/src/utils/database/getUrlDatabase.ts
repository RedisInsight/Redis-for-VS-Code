import { ApiEndpoints, StorageItem } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'
import { sessionStorageService } from 'uiSrc/services'

export const getUrl = (...path: string[]) => {
  // const databaseId = sessionStorageService.get(StorageItem.databaseId)
  const redistackId = '237e722f-1fcb-4271-83a5-33b1afe46c6f'
  const databaseId = redistackId

  return (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
}

export const getDatabaseUrl = (databaseId: Nullable<string>, ...path: string[]) =>
  (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
