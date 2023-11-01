import { CommandGroup } from 'uiSrc/constants/core/commands'

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
