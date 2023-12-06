import { get } from 'lodash'
import { RedisResponseEncoding } from 'uiSrc/interfaces'
import { store } from 'uiSrc/store'

export const getEncoding = (): RedisResponseEncoding =>
  get(store.getState(), 'app.info.encoding', RedisResponseEncoding.Buffer)
