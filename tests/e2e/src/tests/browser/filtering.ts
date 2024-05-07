import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import { TreeView } from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  DropdownActions,
  InputActions,
  TreeViewActions,
} from '@e2eSrc/helpers/common-actions'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  keyLength,
  keyTypes,
  keyTypesShort,
  KeyTypesShort,
} from '@e2eSrc/helpers/constants'

let keyName = `KeyForSearch*?[]789${Common.generateWord(10)}`
let keyName2 = Common.generateWord(10)
let randomValue = Common.generateWord(10)
const valueWithEscapedSymbols = 'KeyFor[A-G]*('
const searchedKeyName = 'KeyForSearch\\*\\?\\[]789'
const searchedValueWithEscapedSymbols = 'KeyFor\\[A-G\\]*('
let keysData = keyTypesShort
  .map((object: any) => ({ ...object }))
  .filter((v: any, i: number) => i <= 6 && i !== 5)
keysData.forEach(
  (key: { keyName: string }) =>
    (key.keyName =
      `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`),
)

describe('Filtering per key name', () => {
  let treeView: TreeView

  before(async () => {
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await CliAPIRequests.sendRedisCliCommandApi(
      `FLUSHDB`,
      Config.ossStandaloneConfig,
    )
  })
  it('Verify that user can search per full key name', async function () {
    randomValue = Common.generateWord(10)
    keyName = `KeyForSearch*?[]789${randomValue}`

    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.String },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Search by key with full name
    await treeView.searchByKeyName(`${searchedKeyName}${randomValue}`)
    // Verify that key was found
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      'The key was not found',
    )
  })

  it('Verify that user can filter per exact key without using any patterns', async function () {
    randomValue = Common.generateWord(10)
    keyName = `KeyForSearch*?[]789${randomValue}`

    // Create new key for search
    await CliAPIRequests.sendRedisCliCommandApi(
      `APPEND ${keyName} 1`,
      Config.ossStandaloneConfig,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Filter per exact key without using any patterns
    await treeView.searchByKeyName(`${searchedKeyName}${randomValue}`)
    // Verify that key was found
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      'The key was not found',
    )
  })

  it('Verify that user can filter per combined pattern with ?, *, [xy], [^x], [a-z] and escaped special symbols', async function () {
    keyName = `KeyForSearch${Common.generateWord(10)}`
    keyName2 = `KeyForSomething${Common.generateWord(10)}`

    // Add keys
    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.String },
      Config.ossStandaloneConfig.databaseName,
    )
    await KeyAPIRequests.addKeyApi(
      { keyName: keyName2, keyType: KeyTypesShort.Hash },
      Config.ossStandaloneConfig.databaseName,
    )
    await KeyAPIRequests.addKeyApi(
      { keyName: valueWithEscapedSymbols, keyType: KeyTypesShort.Hash },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Filter per pattern with ?, *, [xy], [^x], [a-z]
    const searchedValue = 'Key?[A-z]rS[^o][ae]*'
    await treeView.searchByKeyName(searchedValue)
    // Verify that key was found
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      'The key was not found',
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName2)).eql(
      false,
      'The key is found',
    )
    // Filter with escaped special symbols
    await treeView.searchByKeyName(searchedValueWithEscapedSymbols)
    // Verify that key was found
    expect(
      await treeView.isKeyIsDisplayedInTheList(valueWithEscapedSymbols),
    ).eql(true, 'The key was not found')
  })

  it('Verify that user can search a key with selected data type is filters', async function () {
    keyName = Common.generateWord(10)

    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.String },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Search by key with full name & specified type
    await treeView.selectFilterGroupType(KeyTypesShort.String)
    await treeView.searchByKeyName(keyName)
    // Verify that key was found
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      'The key was not found',
    )
    // Verify that user can see filtering per key name starts when he clicks the control to filter per key name
    // Clear filter
    await treeView.clearFilter()
    // Check the filtering starts by clicks the control
    await treeView.searchByKeyName('InvalidText')
    // Verify that when user searches not existed key, no keys found message displayed
    expect(await treeView.getElementText(treeView.treeViewPage)).contains(
      'No results found',
      'Invalid message',
    )
  })

  it('Verify that user can filter keys per data type', async function () {
    keyName = Common.generateWord(10)

    await KeyAPIRequests.addKeysApi(
      keysData,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    for (const { keyType, keyName } of keysData) {
      await treeView.selectFilterGroupType(keyType)
      expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
        true,
        `The key of type ${keyType} was found`,
      )
      await ButtonActions.clickElement(treeView.keyTreeFilterTrigger)
      // Uncomment once Graph key type added
      // keyType !== KeyTypesShort.Graph
      // ?
      expect(
        await DropdownActions.getDropdownValue(treeView.treeViewFilterSelect),
      ).contains(keyType, 'Keys not filtered by key type')
      // : await t.expect(browserPage.filteringLabel.textContent).contains('graphdata', 'Keys not filtered by key type')
      const regExp = new RegExp('/(1/d+)/')
      expect(await treeView.getElementText(treeView.keysSummary)).match(
        regExp,
        'Incorrect number of found keys displayed',
      )
    }
  })

  it('Verify that user can filter per pattern with ? (matches keys with any character (only one) instead of ?)', async function () {
    const randomValue = Common.generateWord(10)
    const searchedValue = `?eyForSearch\\*\\?\\[]789${randomValue}`
    keyName = `KeyForSearch*?[]789${randomValue}`

    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.String },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Filter per pattern with ?
    await treeView.searchByKeyName(searchedValue)
    // Verify that key was found
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      `The key was not found`,
    )
  })

  it('Verify that user can filter per pattern with [xy] (matches one symbol: either x or y))', async function () {
    keyName = `KeyForSearch${Common.generateWord(10)}`
    keyName2 = `KeyForFearch${Common.generateWord(10)}`
    const searchedValue1 = 'KeyFor[SF]*'
    const searchedValue2 = 'KeyFor[^F]*'
    const searchedValue3 = 'KeyFor[A-G]*'

    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.String },
      Config.ossStandaloneConfig.databaseName,
    )
    await KeyAPIRequests.addKeyApi(
      { keyName: keyName2, keyType: KeyTypesShort.Hash },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Filter per pattern with [XY]
    await treeView.searchByKeyName(searchedValue1)
    // Verify that key was found with filter per pattern with [xy]
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      `The key was not found`,
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName2)).eql(
      true,
      `The key was not found`,
    )

    await treeView.searchByKeyName(searchedValue2)
    // Verify that user can filter per pattern with [^x] (matches one symbol except x)
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      `The key was not found`,
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName2)).eql(
      false,
      `The wrong key found`,
    )

    await treeView.searchByKeyName(searchedValue3)
    // Verify that user can filter per pattern with [a-z] (matches any symbol in range from A till Z)
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      false,
      `The wrong key found`,
    )
    expect(await treeView.isKeyIsDisplayedInTheList(keyName2)).eql(
      true,
      `The key was not found`,
    )
  })

  it('Verify that when user clicks on “clear” control with no filter per key name applied all characters and filter per key type are removed', async function () {
    keyName = `KeyForSearch${Common.generateWord(10)}`

    // Set filter by key type and filter per key name
    await treeView.searchByKeyName(keyName)
    await treeView.selectFilterGroupType(KeyTypesShort.Set)
    // Verify that when user clicks on “clear” control and filter per key name is applied all characters and filter per key type are removed
    await treeView.clearFilter()
    await ButtonActions.clickElement(treeView.keyTreeFilterTrigger)
    expect(
      await DropdownActions.getDropdownValue(treeView.treeViewFilterSelect),
    ).contains('all', 'The filter per key type is not removed')
    expect(await InputActions.getInputValue(treeView.treeViewSearchInput)).eql(
      '',
      'All characters from filter input are not removed',
    )

    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.String },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Search for not existed key name
    await treeView.searchByKeyName(keyName2)
    expect(await treeView.getElementText(treeView.treeViewPage)).contains(
      'No results found',
      'Key is not found message not displayed',
    )
    // Verify that when user clicks on “clear” control and filter per key name is applied filter is reset and rescan initiated
    await treeView.clearFilter()
    await ButtonActions.clickElement(treeView.keyTreeFilterTrigger)
    expect(await InputActions.getInputValue(treeView.treeViewSearchInput)).eql(
      '',
      'The filtering is not reset',
    )
    expect(await treeView.getElementText(treeView.treeViewPage)).not.contains(
      'No results found',
      'No results found message is not hidden',
    )
    // Verify that when user clicks on “Cancel” control filter is reset
    await ButtonActions.clickElement(treeView.keyTreeFilterTrigger)
    await InputActions.typeText(treeView.treeViewSearchInput, keyName)
    await DropdownActions.selectDropdownValue(
      treeView.treeViewFilterSelect,
      KeyTypesShort.Set,
    )
    await ButtonActions.clickElement(treeView.keyTreeFilterCancelBtn)
    await ButtonActions.clickElement(treeView.keyTreeFilterTrigger)
    expect(
      await DropdownActions.getDropdownValue(treeView.treeViewFilterSelect),
    ).contains('all', 'The filter per key type is not canceled')
    expect(await InputActions.getInputValue(treeView.treeViewSearchInput)).eql(
      '',
      'All characters from filter input are not removed',
    )
  })
})

describe('Filtering per key name in DB with 10 millions of keys', () => {
  let treeView: TreeView

  before(async () => {
    treeView = new TreeView()
    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneBigConfig,
    )
  })
  after(async () => {
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can filter per exact key without using any patterns in DB with 10 millions of keys', async function () {
    keyName = `KeyForSearch-${Common.generateWord(10)}`

    await KeyAPIRequests.addKeyApi(
      { keyName, keyType: KeyTypesShort.Set },
      Config.ossStandaloneBigConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneBigConfig.databaseName,
    )
    // Search by key name
    await treeView.searchByKeyName(keyName)
    // Verify that required key is displayed
    expect(await treeView.isKeyIsDisplayedInTheList(keyName)).eql(
      true,
      'Key not found',
    )
  })

  it('Verify that user can filter per key name using patterns in DB with 10-50 millions of keys', async function () {
    keyName = 'device*'

    await treeView.selectFilterGroupType(KeyTypesShort.Set)
    await treeView.searchByKeyName(keyName)
    for (let i = 1; i < 10; i++) {
      // Verify that keys are filtered
      const treeItemName = await treeView.getElementText(
        treeView.getTreeViewItemByIndex(i),
      )
      expect(treeItemName).contains(
        'device',
        'Keys filtered incorrectly by key name',
      )
      expect(treeItemName).contains(
        KeyTypesShort.Set,
        'Keys filtered incorrectly by key type',
      )
    }
    // Verify that user can use the "Scan More" button to search per another 2000 keys
    await TreeViewActions.verifyScannningMore()

    // Verify that user can filter per key type in DB with 10-50 millions of keys
    await treeView.clearFilter()
    for (let i = 0; i < keyTypes.length - 1; i++) {
      await treeView.selectFilterGroupType(keyTypes[i].keyName)
      // Verify that all results have the same type as in filter
      expect(
        await treeView.getElementText(treeView.getTreeViewItemByIndex(i)),
      ).contains(keyTypes[i].keyName, 'Keys filtered incorrectly by key type')
    }
  })
})
