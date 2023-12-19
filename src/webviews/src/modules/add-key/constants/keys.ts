import { RedisResponseBuffer } from 'uiSrc/interfaces'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'

export interface IKeyPropTypes {
  nameString: string
  name: RedisResponseBuffer
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  length: number
}
