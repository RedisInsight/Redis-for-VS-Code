import { get } from 'lodash'
import { ApiEndpoints } from 'uiSrc/constants'
import { store } from 'uiSrc/store'

export const getUrl = (...path: string[]) => {
  const state = store.getState()
  const databaseId = get(state, 'connections.databases.connectedDatabase.id', '')

  return (`/${ApiEndpoints.DATABASES}/${databaseId}/${path.join('/')}`)
}
