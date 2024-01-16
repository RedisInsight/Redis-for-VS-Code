import { RedisResponseBuffer } from 'uiSrc/interfaces'
import { AllKeyTypes } from 'uiSrc/constants'

export interface IKeyPropTypes {
  nameString: string
  name: RedisResponseBuffer
  type: AllKeyTypes
  ttl: number
  size: number
  length: number
}
