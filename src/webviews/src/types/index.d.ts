import { Buffer } from 'buffer'
// eslint-disable-next-line import/order
import { Nullable } from 'uiSrc/utils'
import { KeyValueCompressor } from 'uiSrc/constants'
import { RedisString, UintArray } from 'uiSrc/interfaces'

declare global {
  interface Window {
    ri: RedisInsight
    acquireVsCodeApi: Function
    Buffer: typeof Buffer
    app: WindowApp
    windowId?: string
  }
}

export interface RedisInsight {
  bufferToUTF8: (reply: RedisString) => string
  bufferToASCII: (reply: RedisString) => string
  UintArrayToString: (reply: UintArray) => string
  UTF8ToBuffer: (reply: string) => RedisString
  ASCIIToBuffer: (reply: string) => RedisString
  stringToBuffer: (reply: string) => RedisString
  anyToBuffer: (reply: UintArray) => RedisString
  bufferToString: (reply: RedisString) => string
  hexToBuffer: (reply: string) => RedisString
  bufferToHex: (reply: RedisString) => string
  bufferToBinary: (reply: RedisString) => string
  binaryToBuffer: (reply: string) => RedisString
  getCompressor: (reply: RedisString) => Nullable<KeyValueCompressor>
}
