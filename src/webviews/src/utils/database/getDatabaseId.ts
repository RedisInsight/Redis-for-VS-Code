import { get } from 'lodash'
import { store } from 'uiSrc/store'

export const getDatabaseId = (): string =>
  get(store.getState(), 'connections.databases.connectedDatabase.id', '')
