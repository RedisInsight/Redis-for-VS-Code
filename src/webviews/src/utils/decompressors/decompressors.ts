import { forIn, isString } from 'lodash'
import { decompress as decompressFzstd } from 'fzstd'
// @ts-ignore
import { decompress as decompressLz4 } from 'lz4js'
import { decompress as decompressSnappy } from '@stablelib/snappy'
// @ts-ignore
import { decompress as decompressBrotli } from 'brotli-unicode/js'
import { inflate, ungzip } from 'pako'
import { COMPRESSOR_MAGIC_SYMBOLS, ICompressorMagicSymbols, KeyValueCompressor } from 'uiSrc/constants'
import { RedisString, Nullable, RedisResponseBuffer } from 'uiSrc/interfaces'
import { anyToBuffer, bufferToString, bufferToUint8Array, isEqualBuffers } from 'uiSrc/utils'

const decompressingBuffer = (
  reply: RedisString,
  compressorInit: Nullable<KeyValueCompressor> = null,
): { value: RedisString, compressor: Nullable<KeyValueCompressor>, isCompressed: boolean } => {
  const defaultResponse = { value: reply, compressor: null, isCompressed: false }

  if (isString(reply)) {
    return defaultResponse
  }

  const compressorByValue: Nullable<KeyValueCompressor> = getCompressor(reply)
  const compressor = compressorInit === compressorByValue
    || (!compressorByValue && compressorInit)
    ? compressorInit
    : null

  try {
    switch (compressor) {
      case KeyValueCompressor.GZIP: {
        const value = ungzip(Buffer.from(reply as unknown as ArrayBuffer))

        return {
          compressor,
          isCompressed: compressor === compressorByValue,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.ZSTD: {
        const value = decompressFzstd(Buffer.from(reply as unknown as ArrayBuffer))

        return {
          compressor,
          isCompressed: compressor === compressorByValue,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.LZ4: {
        const value = decompressLz4(Buffer.from(reply as unknown as ArrayBuffer))
        return {
          compressor,
          isCompressed: compressor === compressorByValue,
          value: anyToBuffer(value),
        }
      }
      case KeyValueCompressor.SNAPPY: {
        const value = anyToBuffer(decompressSnappy(Buffer.from(reply as unknown as ArrayBuffer)))

        return {
          value,
          compressor,
          // SNAPPY compressor don't have "magic numbers"
          // for detect is value was compressed we should compare reply and decompressed value
          isCompressed: !isEqualBuffers(value, reply),
        }
      }
      case KeyValueCompressor.Brotli: {
        const value = anyToBuffer(decompressBrotli(bufferToString(reply)))

        return {
          value,
          compressor,
          isCompressed: !isEqualBuffers(value, reply),
        }
      }
      case KeyValueCompressor.PHPGZCompress: {
        const decompressedValue = inflate(bufferToUint8Array(reply))
        if (!decompressedValue) return defaultResponse

        const value = anyToBuffer(decompressedValue)
        return {
          value,
          compressor,
          isCompressed: !isEqualBuffers(value, reply),
        }
      }
      default: {
        return defaultResponse
      }
    }
  } catch (error) {
    return { value: reply, compressor, isCompressed: false }
  }
}

const getCompressor = (reply: RedisResponseBuffer): Nullable<KeyValueCompressor> => {
  const replyStart = reply?.data?.slice?.(0, 10)?.join?.(',') ?? ''
  let compressor: Nullable<KeyValueCompressor> = null

  forIn<ICompressorMagicSymbols>(
    COMPRESSOR_MAGIC_SYMBOLS,
    (magicSymbols: string, compressorName: string) => {
      if (
        magicSymbols
        && replyStart.startsWith(magicSymbols)
        && replyStart.length > magicSymbols.length
      ) {
        compressor = compressorName as KeyValueCompressor
        return false // break loop
      }

      return true
    },
  )

  return compressor
}

export {
  getCompressor,
  decompressingBuffer,
}
