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

  TEST_KEYS,
  TEST_KEYS_RESPONSE: [{ keys: TEST_KEYS, total: 3000, scanned: 3000, nextCursor: 0 }],

  APP_INFO_DATA_MOCK: {
    id: 'id1',
    createDateTime: '2000-01-01T00:00:00.000Z',
    appVersion: '2.0.0',
    osPlatform: 'win32',
    buildType: 'ELECTRON',
  },
}
