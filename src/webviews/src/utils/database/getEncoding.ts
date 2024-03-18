import { get } from 'lodash'
import { RedisResponseEncoding } from 'uiSrc/interfaces'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'

export const getEncoding = (): RedisResponseEncoding =>
  get(useAppInfoStore.getState(), 'encoding', RedisResponseEncoding.Buffer)
