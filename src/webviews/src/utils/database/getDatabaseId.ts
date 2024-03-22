import { get } from 'lodash'
import { useDatabasesStore } from 'uiSrc/store'

export const getDatabaseId = (): string =>
  get(useDatabasesStore.getState(), 'connectedDatabase.id', '')
