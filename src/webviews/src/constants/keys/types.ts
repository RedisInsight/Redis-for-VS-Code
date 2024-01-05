import { CommandGroup } from 'uiSrc/constants/core/commands'
import { KeyValueCompressor } from './formatters'
import { ApiEndpoints } from '../core/api'

export enum KeyTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
  Stream = 'stream',
}

export enum ModulesKeyTypes {
  Graph = 'graphdata',
  TimeSeries = 'TSDB-TYPE',
}

export type AllKeyTypes = KeyTypes | ModulesKeyTypes

export const GROUP_TYPES_DISPLAY = Object.freeze({
  [KeyTypes.Hash]: 'Hash',
  [KeyTypes.List]: 'List',
  [KeyTypes.Set]: 'Set',
  [KeyTypes.ZSet]: 'Sorted Set',
  [KeyTypes.String]: 'String',
  [KeyTypes.ReJSON]: 'JSON',
  [KeyTypes.JSON]: 'JSON',
  [KeyTypes.Stream]: 'Stream',
  [ModulesKeyTypes.TimeSeries]: 'TS',
  [CommandGroup.Bitmap]: 'Bitmap',
  [CommandGroup.Cluster]: 'Cluster',
  [CommandGroup.Connection]: 'Connection',
  [CommandGroup.Geo]: 'Geo',
  [CommandGroup.Generic]: 'Generic',
  [CommandGroup.PubSub]: 'Pub/Sub',
  [CommandGroup.Scripting]: 'Scripting',
  [CommandGroup.Transactions]: 'Transactions',
  [CommandGroup.TimeSeries]: 'TimeSeries',
  [CommandGroup.Server]: 'Server',
  [CommandGroup.SortedSet]: 'Sorted Set',
  [CommandGroup.HyperLogLog]: 'HyperLogLog',
  [CommandGroup.CMS]: 'CMS',
  [CommandGroup.TDigest]: 'TDigest',
  [CommandGroup.TopK]: 'TopK',
  [CommandGroup.BloomFilter]: 'Bloom Filter',
  [CommandGroup.CuckooFilter]: 'Cuckoo Filter',
})

export type GroupTypesDisplay = keyof (typeof GROUP_TYPES_DISPLAY)

export interface LengthNamingByType {
  [key: string]: string
}

export const LENGTH_NAMING_BY_TYPE: LengthNamingByType = Object.freeze({
  [ModulesKeyTypes.Graph]: 'Nodes',
  [ModulesKeyTypes.TimeSeries]: 'Samples',
  [KeyTypes.Stream]: 'Entries',
})

export interface ModulesKeyTypesNames {
  [key: string]: string
}

export const MODULES_KEY_TYPES_NAMES: ModulesKeyTypesNames = Object.freeze({
  [ModulesKeyTypes.Graph]: 'RedisGraph',
  [ModulesKeyTypes.TimeSeries]: 'RedisTimeSeries',
})

export const COMPRESSOR_MAGIC_SYMBOLS: ICompressorMagicSymbols = Object.freeze({
  [KeyValueCompressor.GZIP]: '31,139', // 1f 8b hex
  [KeyValueCompressor.ZSTD]: '40,181,47,253', // 28 b5 2f fd hex
  [KeyValueCompressor.LZ4]: '4,34,77,24', // 04 22 4d 18 hex
  [KeyValueCompressor.SNAPPY]: '', // no magic symbols
  [KeyValueCompressor.Brotli]: '', // no magic symbols
  [KeyValueCompressor.PHPGZCompress]: '', // no magic symbols
})

export type ICompressorMagicSymbols = {
  [key in KeyValueCompressor]: string
}

export const ENDPOINT_BASED_ON_KEY_TYPE = Object.freeze({
  [KeyTypes.ZSet]: ApiEndpoints.ZSET,
  [KeyTypes.Set]: ApiEndpoints.SET,
  [KeyTypes.String]: ApiEndpoints.STRING,
  [KeyTypes.Hash]: ApiEndpoints.HASH,
  [KeyTypes.List]: ApiEndpoints.LIST,
  [KeyTypes.ReJSON]: ApiEndpoints.REJSON,
  [KeyTypes.Stream]: ApiEndpoints.STREAMS,
})

export type EndpointBasedOnKeyType = keyof (typeof ENDPOINT_BASED_ON_KEY_TYPE)

export enum SearchHistoryMode {
  Pattern = 'pattern',
  Redisearch = 'redisearch',
}
