import { isString } from 'lodash'
import { ObjectInputStream } from 'java-object-serialization'
import { Buffer } from 'buffer'
import { KeyValueFormat } from 'uiSrc/constants'
import {
  RedisString,
  UintArray,
  Nullable,
  RedisResponseBufferType,
} from 'uiSrc/interfaces'
import JavaDate from './javaDate'

ObjectInputStream.RegisterObjectClass(JavaDate, JavaDate.ClassName, JavaDate.SerialVersionUID)

const decoder = new TextDecoder('utf-8')
const encoder = new TextEncoder()

const isEqualBuffers = (a?: Nullable<RedisString>, b?: Nullable<RedisString>) =>
  (isString(a) || isString(b) ? false : a?.data?.join?.(',') === b?.data?.join?.(','))

// eslint-disable-next-line no-control-regex
const IS_NON_PRINTABLE_ASCII_CHARACTER = /[^ -~\u0007\b\t\n\r]/

const decimalToHexString = (d: number, padding = 2) => {
  const hex = Number(d).toString(16)
  return '0'.repeat(padding).substring(0, padding - hex.length) + hex
}

const bufferToHex = (reply: RedisString): string => {
  let result = ''

  if (isString(reply)) {
    return reply
  }

  reply.data?.forEach((byte: number) => {
    // eslint-disable-next-line
    result += ('0' + (byte & 0xFF).toString(16)).slice(-2)
  })

  return result
}

const bufferToBinary = (reply: RedisString): string => {
  if (isString(reply)) {
    return reply
  }

  return Array.from(reply.data).reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '')
}

const binaryToBuffer = (reply: string) => {
  const data: number[] = reply.match(/.{1,8}/g)?.map((v) => parseInt(v, 2)) || []
  return anyToBuffer(data)
}

const bufferToASCII = (reply: RedisString): string => {
  if (isString(reply)) {
    return reply
  }

  let result = ''
  reply.data.forEach((byte: number) => {
    const char = decoder.decode(new Uint8Array([byte]))
    if (IS_NON_PRINTABLE_ASCII_CHARACTER.test(char)) {
      result += `\\x${decimalToHexString(byte)}`
    } else {
      switch (char) {
        case '\u0007': // Bell character
          result += '\\a'
          break
        case '\\':
          result += '\\\\'
          break
        case '"':
          result += '\\"'
          break
        case '\b':
          result += '\\b'
          break
        case '\t':
          result += '\\t'
          break
        case '\n':
          result += '\\n'
          break
        case '\r':
          result += '\\r'
          break
        default:
          result += char
      }
    }
  })
  return result
}

const anyToBuffer = (reply: UintArray | ArrayBuffer): RedisString =>
  ({ data: reply, type: RedisResponseBufferType.Buffer }) as RedisString

const ASCIIToBuffer = (strInit: string) => {
  let result = ''
  const str = strInit
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\b/g, '\b')
    .replace(/\\t/g, '\t')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')

  for (let i = 0; i < str.length;) {
    if (str.substring(i, i + 2) === '\\x') {
      result += str.substring(i + 2, i + 4)
      i += 4
    } else {
      result += Buffer.from(str[i++]).toString('hex')
    }
  }

  return anyToBuffer(Array.from(Buffer.from(result, 'hex')))
}

const bufferToFloat32Array = (data: Uint8Array) => {
  const { buffer } = new Uint8Array(data)
  const dataView = new DataView(buffer)
  const vector = []

  for (let i = 0; i < dataView.byteLength; i += 4) {
    vector.push(dataView.getFloat32(i, true))
  }
  return new Float32Array(vector)
}

const bufferToFloat64Array = (data: Uint8Array) => {
  const { buffer } = new Uint8Array(data)
  const dataView = new DataView(buffer)
  const vector = []

  for (let i = 0; i < dataView.byteLength; i += 8) {
    vector.push(dataView.getFloat64(i, true))
  }

  return new Float64Array(vector)
}

const bufferToUint8Array = (reply: RedisString): Uint8Array => new Uint8Array(isString(reply) ? [] : reply.data)

const bufferToUTF8 = (reply: RedisString): string => decoder.decode(bufferToUint8Array(reply))

const UintArrayToString = (reply: UintArray): string => decoder.decode(new Uint8Array(reply))

const UTF8ToBuffer = (reply: string): RedisString => anyToBuffer(encoder.encode(reply))

const UTF8ToArray = (reply: string): any => anyToBuffer(Array.from(encoder.encode(reply)))

// common formatters
const stringToBuffer = (data: string, formatResult: KeyValueFormat = KeyValueFormat.Unicode): RedisString => {
  switch (formatResult) {
    case KeyValueFormat.Unicode: {
      return UTF8ToBuffer(data)
    }
    case KeyValueFormat.ASCII: {
      return ASCIIToBuffer(data)
    }
    default: {
      return UTF8ToBuffer(data)
    }
  }
}

const hexToBuffer = (data: string): RedisString => {
  let string = data
  const result = []
  while (string.length >= 2) {
    result.push(parseInt(string.substring(0, 2), 16))
    string = string.substring(2, string.length)
  }
  return { type: RedisResponseBufferType.Buffer, data: result } as RedisString
}

const bufferToJava = (reply: RedisString) => {
  const stream = new ObjectInputStream(bufferToUint8Array(reply))
  const decoded = stream.readObject()

  if (typeof decoded !== 'object') {
    return decoded
  }

  if (decoded instanceof Date) {
    return decoded
  }

  const { fields } = decoded
  const fieldsArray = Array.from(fields, ([key, value]) => ({ [key]: value }))
  return { ...decoded, fields: fieldsArray }
}

const bufferToString = (data: RedisString = '', formatResult: KeyValueFormat = KeyValueFormat.Unicode): string => {
  if (!isString(data) && data?.type === RedisResponseBufferType.Buffer) {
    switch (formatResult) {
      case KeyValueFormat.Unicode: {
        return bufferToUTF8(data)
      }
      case KeyValueFormat.ASCII: {
        return bufferToASCII(data)
      }

      default: {
        return bufferToUTF8(data)
      }
    }
  }
  return data?.toString()
}

export {
  bufferToUTF8,
  bufferToASCII,
  bufferToHex,
  UTF8ToBuffer,
  decimalToHexString,
  ASCIIToBuffer,
  isEqualBuffers,
  stringToBuffer,
  bufferToUint8Array,
  bufferToString,
  UintArrayToString,
  hexToBuffer,
  anyToBuffer,
  bufferToBinary,
  binaryToBuffer,
  bufferToJava,
  bufferToFloat32Array,
  bufferToFloat64Array,
  UTF8ToArray,
}

// for BE libraries which work with Buffer
window.Buffer = Buffer
