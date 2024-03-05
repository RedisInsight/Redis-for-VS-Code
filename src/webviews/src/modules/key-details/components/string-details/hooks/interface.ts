import { IFetchKeyArgs, Nullable, RedisResponseBuffer, RedisString } from 'uiSrc/interfaces'

export interface StringState {
  loading: boolean
  error: string
  isCompressed: boolean
  data: {
    key: RedisString
    value: Nullable<RedisResponseBuffer>
  }
}

export interface StringActions {
  resetStringStore: () => void
  setIsStringCompressed: (data: boolean) => void
  processString: () => void
  processStringFinal: () => void
  processStringSuccess: (data: any) => void
  // updateStringValueAction: (key: RedisString, data: RedisResponseBuffer, onSuccess?: () => void) => void
}
