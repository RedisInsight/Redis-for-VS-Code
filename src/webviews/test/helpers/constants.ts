import { DEFAULT_SEARCH_MATCH, KeyTypes } from 'uiSrc/constants'
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

  // key 4 list
  KEY_NAME_LIST_4: 'key4',
  KEY_NAME_4: UTF8ToArray('key4'),
  KEY_TYPE_4: KeyTypes.List,
  KEY_TTL_4: -1,
  KEY_LENGTH_4: 5,
  KEY_SIZE_4: 10_000,
  KEY_4_INDEX: 0,
  KEY_4_INDEX_2: 1,
  KEY_4_ELEMENT: UTF8ToArray('element'),
  KEY_4_ELEMENT_2: UTF8ToArray('element2'),

  // key 5 set
  KEY_NAME_SET_5: 'key5',
  KEY_NAME_5: UTF8ToArray('key5'),
  KEY_TYPE_5: KeyTypes.Set,
  KEY_TTL_5: -1,
  KEY_LENGTH_5: 5,
  KEY_SIZE_5: 10_000,
  KEY_5_MEMBER: UTF8ToArray('member'),
  KEY_5_MEMBER_2: UTF8ToArray('member2'),
  KEY_5_MEMBER_3: UTF8ToArray('member3'),

  get LIST_DATA_RESPONSE() {
    return LIST_DATA_RESPONSE
  },

  get LIST_DATA() {
    return LIST_DATA
  },

  get SET_DATA() {
    return SET_DATA
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
  match: DEFAULT_SEARCH_MATCH,
}

const HASH_DATA = {
  keyName: constants.KEY_NAME_2,
  fields: [{ field: constants.KEY_2_FIELD, value: constants.KEY_2_VALUE }],
  total: constants.KEY_LENGTH_2,
  nextCursor: 0,
  match: DEFAULT_SEARCH_MATCH,
}

const LIST_DATA_RESPONSE = {
  keyName: constants.KEY_NAME_4,
  elements: [constants.KEY_4_ELEMENT, constants.KEY_4_ELEMENT_2],
  total: constants.KEY_LENGTH_4,
  nextCursor: 0,
}

const SET_DATA = {
  keyName: constants.KEY_NAME_5,
  members: [constants.KEY_5_MEMBER, constants.KEY_5_MEMBER_2],
  total: constants.KEY_LENGTH_5,
  nextCursor: 0,
  match: DEFAULT_SEARCH_MATCH,
}

const LIST_DATA = {
  ...LIST_DATA_RESPONSE,
  searchedIndex: null,
  elements: [
    { element: constants.KEY_4_ELEMENT, index: constants.KEY_4_INDEX },
    { element: constants.KEY_4_ELEMENT_2, index: constants.KEY_4_INDEX_2 },
  ],
}
