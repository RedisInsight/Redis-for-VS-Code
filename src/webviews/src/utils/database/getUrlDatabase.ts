import { ApiEndpoints } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

export const getUrl = (...path: string[]) => {
  const databaseId = window.ri?.database?.id || ''

  return (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
}

export const getDatabaseUrl = (databaseId: Nullable<string>, ...path: string[]) =>
  (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
