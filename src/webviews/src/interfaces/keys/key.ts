import { KeyTypes } from 'uiSrc/constants'
import { RedisString } from '../core/app'

export interface IFetchKeyArgs {
  resetData?: boolean
  start?: number
  end?: number
}

export interface GetKeyInfoResponse {
  name: RedisString
  type?: KeyTypes
  ttl?: number
  size?: number
  length?: number
}

export interface KeyInfo extends GetKeyInfoResponse {
  nameString?: string
  path?: string
}
