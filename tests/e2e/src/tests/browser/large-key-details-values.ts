import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import {
  WebView,
  SortedSetKeyDetailsView,
  TreeView,
  ListKeyDetailsView,
  HashKeyDetailsView,
  SetKeyDetailsView,
  StringKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  ListKeyParameters,
  HashKeyParameters,
  SortedSetKeyParameters,
  SetKeyParameters,
  StringKeyParameters,
} from '@e2eSrc/helpers/types/types'
import { CommonDriverExtension } from '@e2eSrc/helpers'

let keyName: string

describe('Large key details verification', () => {
  let webView: WebView
  let sortedsetKeyDetailsView: SortedSetKeyDetailsView
  let hashKeyDetailsView: HashKeyDetailsView
  let treeView: TreeView
  let listKeyDetailsView: ListKeyDetailsView
  let setKeyDetailsView: SetKeyDetailsView
  let stringKeyDetailsView: StringKeyDetailsView

  before(async () => {
    webView = new WebView()
    sortedsetKeyDetailsView = new SortedSetKeyDetailsView()
    hashKeyDetailsView = new HashKeyDetailsView()
    treeView = new TreeView()
    listKeyDetailsView = new ListKeyDetailsView()
    setKeyDetailsView = new SetKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await webView.switchBack()
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await webView.switchToFrame(Views.TreeView)
  })
  after(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can expand/collapse for sorted set data type', async function () {
    keyName = Common.generateWord(20)
    const sortedSetKeyParameters: SortedSetKeyParameters = {
      keyName: keyName,
      members: [
        {
          name: 'wqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsa',
          score: 1,
        },
      ],
    }

    await KeyAPIRequests.addSortedSetKeyApi(
      sortedSetKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const memberValueCell = await sortedsetKeyDetailsView.getElement(
      sortedsetKeyDetailsView.sortedSetFieldsList,
    )
    const size = await memberValueCell.getRect()
    const rowHeight = size.height

    await ButtonActions.clickAndWaitForElement(
      sortedsetKeyDetailsView.sortedSetFieldsList,
      sortedsetKeyDetailsView.truncatedValue,
      false,
    )

    let newSize = await memberValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonActions.clickAndWaitForElement(
      sortedsetKeyDetailsView.sortedSetFieldsList,
      sortedsetKeyDetailsView.truncatedValue,
    )

    newSize = await memberValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
  it('Verify that user can expand/collapse for hash data type', async function () {
    keyName = Common.generateWord(20)
    const hashKeyParameters: HashKeyParameters = {
      keyName: keyName,
      fields: [
        {
          field: 'keyFieldValue',
          value:
            'keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue keyValue ',
        },
      ],
    }

    await KeyAPIRequests.addHashKeyApi(
      hashKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const memberValueCell = await hashKeyDetailsView.getElement(
      hashKeyDetailsView.hashValuesList,
    )
    const size = await memberValueCell.getRect()
    const rowHeight = size.height

    await ButtonActions.clickAndWaitForElement(
      hashKeyDetailsView.hashValuesList,
      hashKeyDetailsView.truncatedValue,
      false,
    )

    let newSize = await memberValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonActions.clickAndWaitForElement(
      hashKeyDetailsView.hashValuesList,
      hashKeyDetailsView.truncatedValue,
    )

    newSize = await memberValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
  it('Verify that user can expand/collapse for list data type', async function () {
    keyName = Common.generateWord(20)
    const listKeyParameters: ListKeyParameters = {
      keyName: keyName,
      element:
        'wqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsa',
    }

    await KeyAPIRequests.addListKeyApi(
      listKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const elementValueCell = await listKeyDetailsView.getElement(
      listKeyDetailsView.elementsList,
    )
    const size = await elementValueCell.getRect()
    const rowHeight = size.height

    await ButtonActions.clickAndWaitForElement(
      listKeyDetailsView.elementsList,
      listKeyDetailsView.truncatedValue,
      false,
    )
    // Verify that user can expand a row of list data type
    let newSize = await elementValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonActions.clickAndWaitForElement(
      listKeyDetailsView.elementsList,
      listKeyDetailsView.truncatedValue,
    )
    // Verify that user can collapse a row of list data type
    newSize = await elementValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
  it('Verify that user can expand/collapse for set data type', async function () {
    keyName = Common.generateWord(20)
    const setKeyParameters: SetKeyParameters = {
      keyName: keyName,
      members: [
        'wqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsawqertjhhgfdasdfghfdsadfghfdsa',
      ],
    }

    await KeyAPIRequests.addSetKeyApi(
      setKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const memberValueCell = await setKeyDetailsView.getElement(
      setKeyDetailsView.setFieldsList,
    )
    const size = await memberValueCell.getRect()
    const rowHeight = size.height

    await ButtonActions.clickAndWaitForElement(
      setKeyDetailsView.setFieldsList,
      setKeyDetailsView.truncatedValue,
      false,
    )

    let newSize = await memberValueCell.getRect()
    expect(newSize.height).gt(rowHeight, 'Row is not expanded')

    await ButtonActions.clickAndWaitForElement(
      setKeyDetailsView.setFieldsList,
      setKeyDetailsView.truncatedValue,
    )

    newSize = await memberValueCell.getRect()
    expect(newSize.height).eql(rowHeight, 'Row is not collapsed')
  })
  it('Verify that user can download String key value as txt file when it has > 5000 characters', async function () {
    keyName = Common.generateWord(10)
    // let foundStringDownloadedFiles = 0
    // const downloadedFile = 'string_value'
    const bigKeyName = Common.generateWord(10)
    // Create string key with 5000 characters
    const length = 5000
    const keyValue = Common.generateWord(length)
    const stringKeyParameters: StringKeyParameters = {
      keyName: keyName,
      value: keyValue,
    }
    const bigStringKeyParameters: StringKeyParameters = {
      keyName: bigKeyName,
      value: keyValue + 1,
    }

    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: stringKeyParameters.keyName,
        value: stringKeyParameters.value,
      },
      Config.ossStandaloneConfig.databaseName,
    )

    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: bigStringKeyParameters.keyName,
        value: bigStringKeyParameters.value,
      },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await stringKeyDetailsView.isElementDisplayed(
        stringKeyDetailsView.loadAllBtn,
      ),
    ).false
    expect(
      await stringKeyDetailsView.isElementDisplayed(
        stringKeyDetailsView.downloadAllValueBtn,
      ),
    ).false

    await webView.switchBack()
    await webView.switchToFrame(Views.TreeView)
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
      bigStringKeyParameters.keyName,
    )
    expect(
      await stringKeyDetailsView.isElementDisabled(
        stringKeyDetailsView.editKeyValueButton,
        'class',
      ),
    ).true

    // Verify that user can see String key value with only 5000 characters uploaded if length is more than 5000
    // Verify that 3 dots after truncated big strings displayed
    expect(
      (
        await stringKeyDetailsView.getElementText(
          stringKeyDetailsView.stringKeyValueInput,
        )
      ).length,
    ).eql(
      stringKeyParameters.value.length + 3,
      'String key > 5000 value is not fully loaded after clicking Load All',
    )

    await ButtonActions.clickElement(stringKeyDetailsView.loadAllBtn)
    await CommonDriverExtension.driverSleep(1000)
    // Verify that user can see "Load all" button for String Key with more than 5000 characters and see full value by clicking on it
    expect(
      (
        await stringKeyDetailsView.getElementText(
          stringKeyDetailsView.stringKeyValueInput,
        )
      ).length,
    ).eql(
      bigStringKeyParameters.value.length,
      'String key > 5000 value is not fully loaded after clicking Load All',
    )
    expect(
      await stringKeyDetailsView.isElementDisabled(
        stringKeyDetailsView.editKeyValueButton,
        'class',
      ),
    ).false
    // Verify that user can see not fully loaded String key with > 5000 characters after clicking on Refresh button
    await ButtonActions.clickElement(stringKeyDetailsView.refreshKeyButton)
    expect(
      await stringKeyDetailsView.isElementDisplayed(
        stringKeyDetailsView.loadAllBtn,
      ),
    ).true

    // Uncomment in case if it is possible to download file from system window using vscode-extension-tester
    // Verify that user can download String key value as txt file when it has > 5000 characters
    // await ButtonActions.clickElement(stringKeyDetailsView.downloadAllValueBtn)
    // Verify that user can see default file name is “string_value” when downloading String key value
    // foundStringDownloadedFiles = await DatabasesActions.getFileCount(
    //   Config.fileDownloadPath,
    //   downloadedFile,
    // )
    // expect(foundStringDownloadedFiles).gt(0, 'String value file not saved')
  })
})
