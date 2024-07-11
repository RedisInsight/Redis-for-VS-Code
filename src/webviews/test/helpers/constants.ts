import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_ERROR_MESSAGE, DEFAULT_SEARCH_MATCH, KeyTypes } from 'uiSrc/constants'
import { KeyInfo } from 'uiSrc/interfaces'
import { Certificate } from 'uiSrc/store/hooks/use-certificates-store/interface'
import { UTF8ToArray, stringToBuffer } from 'uiSrc/utils'
import { Database } from 'uiSrc/store'

const COMMON_CONSENT_CONTENT = {
  defaultValue: false,
  required: false,
  editable: true,
  disabled: false,
  displayInSetting: true,
  since: '1.0.0',
  title: 'Title',
  label: '<a>Text</a>',
}

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

  DATABASE_ID: 'databaseId',

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

  get KEYS_LIST() {
    return KEYS_LIST
  },

  // key 1 string
  KEY_NAME_STRING_1: 'key1',
  KEY_NAME_1: UTF8ToArray('key1'),
  KEY_TYPE_1: KeyTypes.String,
  KEY_TTL_1: -1,
  KEY_LENGTH_1: 10,
  KEY_SIZE_1: 1_000,
  KEY_1_VALUE: UTF8ToArray('value'),
  KEY_1_VALUE_FULL: UTF8ToArray('value_full'),
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

  get CA_CERTS() {
    return CA_CERTS
  },

  get CLIENT_CERTS() {
    return CLIENT_CERTS
  },

  TEST_DATABASE_ID: uuidv4(),
  TEST_DATABASE_NAME: uuidv4(),
  TEST_DATABASE_HOST: uuidv4(),
  TEST_DATABASE_PORT: 5555,
  TEST_DATABASE_MODULES: [],
  TEST_DATABASE_VERSION: '7',

  get DATABASE() {
    return DATABASE
  },

  AXIOS_ERROR: {
    response: {
      status: 500,
      data: { message: DEFAULT_ERROR_MESSAGE },
    },
  },

  get COMMON_CONSENT_CONTENT() {
    return COMMON_CONSENT_CONTENT
  },

  get REDIS_COMMANDS() {
    return REDIS_COMMANDS
  },

  get REJSON_DATA() {
    return REJSON_DATA
  },

  get REJSON_DATA_OBJECT() {
    return REJSON_DATA_OBJECT
  },

  get REJSON_DATA_ARRAY() {
    return REJSON_DATA_ARRAY
  },

  get REJSON_DATA_RESPONSE() {
    return REJSON_DATA_RESPONSE
  },

  get REDIS_COMMANDS_ARRAY() {
    return Object.keys(REDIS_COMMANDS).sort()
  },

  get REDIS_COMMANDS_GROUPS() {
    return ['info', 'server']
  },

  SERVER_INFO: {
    id: 'cceadb87-d2aa-47be-b647-5be34dcb8636',
    createDateTime: '2024-02-27T13:10:54.000Z',
    sessionId: 1710764631838,
    appVersion: '2.44.0',
    osPlatform: 'darwin',
    buildType: 'ELECTRON',
    appType: 'ELECTRON',
    encryptionStrategies: [
      'PLAIN',
      'KEYTAR',
    ],
    controlNumber: 41.74,
    controlGroup: '41',
  },

  SETTINGS: {
    theme: null,
    scanThreshold: 10000,
    batchSize: 5,
    agreements: {
      analytics: true,
      notifications: false,
      encryption: false,
      eula: true,
      version: '1.0.6',
    },
  },

  SETTINGS_AGREEMENTS_SPEC: {
    version: '1.0.6',
    agreements: {
      analytics: {
        ...COMMON_CONSENT_CONTENT,
      },
    },
  },

  COMMAND: 'keys *',
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

const REJSON_DATA = { a: 1, b: null, c: 'string', d: true }
const REJSON_DATA_OBJECT = { a: { a: 1, b: null, c: 'string', d: true } }
const REJSON_DATA_ARRAY = { a: [1, null, 'aaa'] }
const REJSON_DATA_RESPONSE = { data: REJSON_DATA, downloaded: true, path: '.' }

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

const KEYS_LIST: any = {
  total: 249,
  nextCursor: '228',
  previousResultCount: 0,
  lastRefreshTime: 0,
  keys: [
    {
      name: stringToBuffer(constants.KEY_NAME_1),
      type: constants.KEY_TYPE_1,
      ttl: constants.KEY_TTL_1,
      size: constants.KEY_SIZE_1,
    },
    {
      name: stringToBuffer(constants.KEY_NAME_2),
      type: constants.KEY_TYPE_2,
      ttl: constants.KEY_TTL_2,
      size: constants.KEY_SIZE_2,
    },
  ],
}

const CA_CERTS: Certificate[] = [{ id: 'id1', name: 'ca_name1' }, { id: 'id2', name: 'ca_name2' }]
const CLIENT_CERTS: Certificate[] = [{ id: 'id11', name: 'client_name1' }, { id: 'id12', name: 'client_name2' }]

const DATABASE: Database = {
  id: constants.TEST_DATABASE_ID,
  host: constants.TEST_DATABASE_HOST,
  port: constants.TEST_DATABASE_PORT,
  name: constants.TEST_DATABASE_NAME,
  modules: constants.TEST_DATABASE_MODULES,
  version: constants.TEST_DATABASE_VERSION,
}

const REDIS_COMMANDS = {
  INFO: {
    summary: 'INFO',
    since: '6.0.0',
    group: 'info',
    complexity: 'Depends on subcommand.',
    acl_categories: [
      '@slow',
    ],
    arity: -2,
    provider: 'main',
  },
  ACL: {
    summary: 'A container for Access List Control commands.',
    since: '6.0.0',
    group: 'server',
    complexity: 'Depends on subcommand.',
    acl_categories: [
      '@slow',
    ],
    arity: -2,
    provider: 'main',
  },
}
