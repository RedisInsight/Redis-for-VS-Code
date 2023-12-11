import { KeyTypes } from 'uiSrc/constants'
import { KeyInfo } from 'uiSrc/interfaces'
import { UTF8ToArray } from 'uiSrc/utils'

const TEST_KEYS = [
  { name: UTF8ToArray('keys:1:2') },
  { name: UTF8ToArray('keys2') },
  { name: UTF8ToArray('keys:1:1') },
  { name: UTF8ToArray('empty::test') },
  { name: UTF8ToArray('test1') },
  { name: UTF8ToArray('test2') },
  { name: UTF8ToArray('keys:1') },
  { name: UTF8ToArray('keys1') },
  { name: UTF8ToArray('keys:3') },
  { name: UTF8ToArray('keys:2') },
]

export const constants = {
  MOCK_TIMESTAMP: 1629128049027,

  INSTANCE_ID: 'instanceId',

  TEST_KEYS,
  TEST_KEYS_RESPONSE: [{ keys: TEST_KEYS, total: 3000, scanned: 3000, nextCursor: 0 }],

  APP_INFO_DATA_MOCK: {
    id: 'id1',
    createDateTime: '2000-01-01T00:00:00.000Z',
    appVersion: '2.0.0',
    osPlatform: 'win32',
    buildType: 'ELECTRON',
  },

  get KEY_INFO() {
    return KEY_INFO
  },

  // key 1 string
  KEY_NAME_STRING_1: 'key1',
  KEY_NAME_1: UTF8ToArray('key1'),
  KEY_TYPE_1: KeyTypes.String,
  KEY_TTL_1: -1,
  KEY_LENGTH_1: 5,
  KEY_SIZE_1: 1_000,
  KEY_1_VALUE: UTF8ToArray('value'),
  KEY_1_VALUE_2: UTF8ToArray('value2'),

  // key 2 hash
  KEY_NAME_HASH_2: 'key2',
  KEY_NAME_2: UTF8ToArray('key2'),
  KEY_TYPE_2: KeyTypes.Hash,
  KEY_TTL_2: -1,
  KEY_LENGTH_2: 5,
  KEY_SIZE_2: 10_000,
  KEY_2_FIELD: UTF8ToArray('field'),
  KEY_2_VALUE: UTF8ToArray('value'),
  KEY_2_VALUE_2: UTF8ToArray('value2'),

  get HASH_DATA() {
    return HASH_DATA
  },

  // key 3 zset
  KEY_NAME_ZSET_3: 'key3',
  KEY_NAME_3: UTF8ToArray('key3'),
  KEY_TYPE_3: KeyTypes.ZSet,
  KEY_TTL_3: -1,
  KEY_LENGTH_3: 5,
  KEY_SIZE_3: 10_000,
  KEY_3_MEMBER: UTF8ToArray('member'),
  KEY_3_SCORE: 123,
  KEY_3_MEMBER_2: UTF8ToArray('member2'),
  KEY_3_SCORE_2: 12312,

  get ZSET_DATA() {
    return ZSET_DATA
  },
}

const KEY_INFO: KeyInfo = {
  name: constants.KEY_NAME_1,
  type: constants.KEY_TYPE_1,
  length: constants.KEY_LENGTH_1,
  size: constants.KEY_SIZE_1,
  ttl: constants.KEY_TTL_1,
}

const ZSET_DATA = {
  keyName: constants.KEY_NAME_3,
  members: [{ name: constants.KEY_3_MEMBER, score: constants.KEY_3_SCORE }],
  total: constants.KEY_LENGTH_3,
  nextCursor: 0,
}

const HASH_DATA = {
  keyName: constants.KEY_NAME_2,
  fields: [{ field: constants.KEY_2_FIELD, value: constants.KEY_2_VALUE }],
  total: constants.KEY_LENGTH_2,
  nextCursor: 0,
}
