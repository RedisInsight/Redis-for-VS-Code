import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import { KeyDetailsView, TreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { COMMANDS_TO_CREATE_KEY, keyLength } from '@e2eSrc/helpers/constants'
import { keyTypes } from '@e2eSrc/helpers/constants'
import { DatabasesActions } from '@e2eSrc/helpers/common-actions'
import { Config } from '@e2eSrc/helpers'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { StringKeyParameters } from '@e2eSrc/helpers/types/types'

const keysData = keyTypes.map(object => ({ ...object })).slice(0, 6)
for (const key of keysData) {
  key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`
}
// Arrays with TTL in seconds, min, hours, days, months, years and their values in tree view
const ttlForSet = [59, 800, 20000, 2000000, 31000000, 2147483647]
// const ttlValues = ['s', '13 min', '5 h', '23 d', '11 mo', '68 yr']

describe('TTL values in Keys Table', () => {
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView

  before(async () => {
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await CliAPIRequests.sendRedisCliCommandApi(
      `FLUSHDB`,
      Config.ossStandaloneConfig,
    )
  })

  after(async () => {
    await treeView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that Key is deleted if TTL finishes', async function () {
    // Create new key with TTL
    const TTL = 5
    const keyName = Common.generateWord(10)
    const stringKeyParameters: StringKeyParameters = {
      keyName: keyName,
      value: 'Value',
      expire: TTL,
    }

    await KeyAPIRequests.addStringKeyApi(
      stringKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    // Verify that the key is really added
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      'Key not added',
    )

    // Check that key with finished TTL is deleted
    await CommonDriverExtension.driverSleep((TTL + 2) * 1000)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      false,
      'Key is still displayed',
    )
  })
  // unskip when TTL value added to key in key list
  it.skip('Verify that user can see TTL in the list of keys rounded down to the nearest unit', async function () {
    for (let i = 0; i < keysData.length; i++) {
      await CliAPIRequests.sendRedisCliCommandApi(
        `${COMMANDS_TO_CREATE_KEY[keysData[i].textType](
          keysData[i].keyName,
        )} EXPIRE ${ttlForSet[i]}`,
        Config.ossStandaloneConfig,
      )
    }
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // TODO unskip when TTL value added to key in key list
    // Check that Keys has correct TTL value in keys table
  })
})
