// @ts-ignore
import { getData } from 'rawproto'
import { decode, encode } from 'msgpackr'
import { isString, isUndefined } from 'lodash'
import { serialize, unserialize } from 'php-serialize'
import { Parser } from 'pickleparser'
import JSONBigInt from 'json-bigint'
import { Buffer } from 'buffer'

import { JSONViewer } from 'uiSrc/ui'
import { KeyValueFormat } from 'uiSrc/constants'
import { RedisString, Maybe } from 'uiSrc/interfaces'
import {
  anyToBuffer,
  bufferToASCII,
  bufferToBinary,
  bufferToHex,
  bufferToUTF8,
  bufferToJava,
  hexToBuffer,
  stringToBuffer,
  binaryToBuffer,
  bufferToFloat64Array,
  bufferToFloat32Array,
  isEqualBuffers,
  UTF8ToBuffer,
} from 'uiSrc/utils'
import { reSerializeJSON } from 'uiSrc/utils/formatters/json'

export interface FormattingProps {
  expanded?: boolean
  skipVector?: boolean
}

const isTextViewFormatter = (format: KeyValueFormat) => [
  KeyValueFormat.Unicode,
  KeyValueFormat.ASCII,
  KeyValueFormat.HEX,
  KeyValueFormat.Binary,
].includes(format)
const isJsonViewFormatter = (format: KeyValueFormat) => !isTextViewFormatter(format)
const isFormatEditable = (format: KeyValueFormat) => ![
  KeyValueFormat.Protobuf,
  KeyValueFormat.JAVA,
  KeyValueFormat.Pickle,
  KeyValueFormat.Vector32Bit,
  KeyValueFormat.Vector64Bit,
].includes(format)

const isFullStringLoaded = (currentLength: Maybe<number>, fullLength: Maybe<number>) => currentLength === fullLength

const isNonUnicodeFormatter = (format: KeyValueFormat, isValid: boolean) => {
  if (format === KeyValueFormat.Msgpack) {
    return isValid
  }
  return [
    KeyValueFormat.ASCII,
    KeyValueFormat.HEX,
    KeyValueFormat.Binary,
  ].includes(format)
}

const bufferToUnicode = (reply: RedisString): string =>
  bufferToUTF8(reply)

const bufferToJSON = (
  reply: RedisString,
  props: FormattingProps,
): { value: JSX.Element | string, isValid: boolean } =>
  JSONViewer({ value: bufferToUTF8(reply), ...props })

const formattingBuffer = (
  reply: RedisString,
  format: KeyValueFormat,
  props?: FormattingProps,
): { value: JSX.Element | string, isValid: boolean } => {
  if (isString(reply)) {
    return { value: reply, isValid: true }
  }
  switch (format) {
    case KeyValueFormat.ASCII: return { value: bufferToASCII(reply), isValid: true }
    case KeyValueFormat.HEX: return { value: bufferToHex(reply), isValid: true }
    case KeyValueFormat.Binary: return { value: bufferToBinary(reply), isValid: true }
    case KeyValueFormat.JSON: return bufferToJSON(reply, props as FormattingProps)
    case KeyValueFormat.Msgpack: {
      try {
        const decoded = decode(Uint8Array.from(reply.data))
        const value = JSONBigInt.stringify(decoded)
        return JSONViewer({ value, ...props })
      } catch (e) {
        return { value: bufferToUTF8(reply), isValid: false }
      }
    }
    case KeyValueFormat.PHP: {
      try {
        const decoded = unserialize(Buffer.from(reply.data), {}, { strict: false, encoding: 'binary' })
        const value = JSONBigInt.stringify(decoded)
        return JSONViewer({ value, ...props })
      } catch (e) {
        return { value: bufferToUTF8(reply), isValid: false }
      }
    }
    case KeyValueFormat.JAVA: {
      try {
        const decoded = bufferToJava(reply)
        const value = JSONBigInt.stringify(decoded)
        return JSONViewer({ value, ...props })
      } catch (e) {
        return { value: bufferToUTF8(reply), isValid: false }
      }
    }
    case KeyValueFormat.Vector32Bit: {
      const valueUTF = bufferToUTF8(reply)
      try {
        if (props?.skipVector) return { value: valueUTF, isValid: true }
        if (isEqualBuffers(reply, UTF8ToBuffer(valueUTF))) {
          return { value: valueUTF, isValid: false }
        }

        const vector = Array.from(bufferToFloat32Array(reply.data as Uint8Array))
        const value = JSONBigInt.stringify(vector)

        return JSONViewer({ value, useNativeBigInt: false, ...props })
      } catch (e) {
        return { value: valueUTF, isValid: false }
      }
    }
    case KeyValueFormat.Vector64Bit: {
      const valueUTF = bufferToUTF8(reply)
      try {
        if (props?.skipVector) return { value: valueUTF, isValid: true }
        if (isEqualBuffers(reply, UTF8ToBuffer(valueUTF))) {
          return { value: valueUTF, isValid: false }
        }

        const vector = Array.from(bufferToFloat64Array(reply.data as Uint8Array))
        const value = JSONBigInt.stringify(vector)
        return JSONViewer({ value, useNativeBigInt: false, ...props })
      } catch (e) {
        return { value: valueUTF, isValid: false }
      }
    }
    case KeyValueFormat.Protobuf: {
      try {
        const decoded = getData(Buffer.from(reply.data))
        const value = JSONBigInt.stringify(decoded)
        return JSONViewer({ value, ...props })
      } catch (e) {
        return { value: bufferToUTF8(reply), isValid: false }
      }
    }
    case KeyValueFormat.Pickle: {
      try {
        const parser = new Parser()
        const decoded = parser.parse(new Uint8Array(reply.data))

        if (isUndefined(decoded)) {
          return {
            value: bufferToUTF8(reply),
            isValid: false,
          }
        }

        const value = JSONBigInt.stringify(decoded)
        return JSONViewer({ value, ...props })
      } catch (e) {
        return { value: bufferToUTF8(reply), isValid: false }
      }
    }
    default: return { value: bufferToUnicode(reply), isValid: true }
  }
}

const bufferToSerializedFormat = (
  format: KeyValueFormat,
  value: RedisString = stringToBuffer(''),
  space?: number,
): string => {
  if (isString(value)) {
    return value
  }

  switch (format) {
    case KeyValueFormat.ASCII: return bufferToASCII(value)
    case KeyValueFormat.HEX: return bufferToHex(value)
    case KeyValueFormat.Binary: return bufferToBinary(value)
    case KeyValueFormat.JSON: return reSerializeJSON(bufferToUTF8(value), space)
    case KeyValueFormat.Vector32Bit: return bufferToFloat32Array(value.data as Uint8Array) as any
    case KeyValueFormat.Vector64Bit: return bufferToFloat64Array(value.data as Uint8Array) as any
    case KeyValueFormat.Msgpack: {
      try {
        const decoded = decode(Uint8Array.from(value.data))
        const stringified = JSON.stringify(decoded)
        return reSerializeJSON(stringified, space)
      } catch (e) {
        return bufferToUTF8(value)
      }
    }
    case KeyValueFormat.PHP: {
      try {
        const decoded = unserialize(Buffer.from(value.data), {}, { strict: false, encoding: 'binary' })
        const stringified = JSON.stringify(decoded)
        return reSerializeJSON(stringified, space)
      } catch (e) {
        return bufferToUTF8(value)
      }
    }
    default: return bufferToUTF8(value)
  }
}

const stringToSerializedBufferFormat = (format: KeyValueFormat, value: string): RedisString => {
  switch (format) {
    case KeyValueFormat.HEX: {
      if ((value.match(/([0-9]|[a-f])/gim) || []).length === value.length && (value.length % 2 === 0)) {
        return hexToBuffer(value)
      }
      return stringToBuffer(value)
    }
    case KeyValueFormat.Binary: {
      const str = value.replace(/ /g, '')
      if (str.length % 8 === 0 && /^[0-1]+$/g.test(str)) {
        return binaryToBuffer(str)
      }
      return stringToBuffer(value)
    }
    case KeyValueFormat.JSON: {
      return stringToBuffer(reSerializeJSON(value))
    }
    case KeyValueFormat.Msgpack: {
      try {
        const json = JSON.parse(value)
        const encoded = encode(json)
        return anyToBuffer(encoded)
      } catch (e) {
        return stringToBuffer(value, format)
      }
    }
    case KeyValueFormat.PHP: {
      try {
        const json = JSON.parse(value)
        const serialized = serialize(json)
        return stringToBuffer(serialized)
      } catch (e) {
        return stringToBuffer(value, format)
      }
    }
    default: {
      return stringToBuffer(value, format)
    }
  }
}

export {
  formattingBuffer,
  isTextViewFormatter,
  isJsonViewFormatter,
  isFormatEditable,
  isFullStringLoaded,
  bufferToSerializedFormat,
  stringToSerializedBufferFormat,
  isNonUnicodeFormatter,
}
