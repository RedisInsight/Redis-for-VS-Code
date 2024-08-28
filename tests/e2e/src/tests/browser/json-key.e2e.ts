import { expect } from 'chai'
import { describe, it } from 'mocha'
import path = require('path')
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import {
  AddJsonKeyView,
  JsonKeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
  NotificationActions,
} from '@e2eSrc/helpers/common-actions'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { CommonDriverExtension } from '@e2eSrc/helpers'
import { indexOf } from 'lodash'

let keyName: string
const jsonKeys = [
  ['JSON-string', '"test"'],
  ['JSON-number', '782364'],
  ['JSON-boolean', 'true'],
  ['JSON-null', 'null'],
  ['JSON-array', '[1, 2, 3]'],
]
const value = '{"name":"xyz"}'
const jsonObjectValue = '{name:"xyz"}'
const filePath = path.join(
  '..',
  '..',
  '..',
  '..',
  'src',
  'test-data',
  'upload-json',
  'sample.json',
)
const jsonValues = [
  '"Live JSON generator"',
  '3.1',
  '"2014-06-25T00:00:00.000Z"',
  'true',
]

describe('JSON Key verification', () => {
  let keyDetailsView: JsonKeyDetailsView
  let treeView: TreeView

  before(async () => {
    keyDetailsView = new JsonKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  beforeEach(async () => {
    await keyDetailsView.switchBack()
    keyName = Common.generateWord(10)
    const jsonKeyParameters: JsonKeyParameters = {
      keyName: keyName,
      data: value,
    }
    // Replace with UI method once this add json feature implemented
    await KeyAPIRequests.addJsonKeyApi(
      jsonKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)
  })
  afterEach(async () => {
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
    await keyDetailsView.switchBack()
    await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can add key with value to any level of JSON structure', async function () {
    // Verify that user can create JSON object
    let jsonValue = await keyDetailsView.getElementText(
      keyDetailsView.jsonKeyValue,
    )
    expect(
      await keyDetailsView.isElementDisplayed(
        keyDetailsView.addJsonObjectButton,
      ),
    ).eql(true, 'The add Json object button not found')
    expect(Common.formatJsonString(jsonValue)).eql(
      jsonObjectValue,
      'The json object value not found',
    )

    // Add key with value on the same level
    await keyDetailsView.addJsonKeyOnTheSameLevel('"key1"', '"value1"')
    // Check the added key contains json object with added key
    expect(
      await keyDetailsView.waitForElementVisibility(
        keyDetailsView.addJsonObjectButton,
      ),
    ).eql(true, 'The add Json object button not found')
    jsonValue = await keyDetailsView.getElementText(keyDetailsView.jsonKeyValue)
    expect(Common.formatJsonString(jsonValue)).eql(
      '{name:"xyz"key1:"value1"}',
      'The json object value not found',
    )

    // Add key with value inside the json
    await keyDetailsView.addJsonKeyOnTheSameLevel('"key2"', '{}')
    await keyDetailsView.addJsonKeyInsideStructure('"key2222"', '12345')

    jsonValue = await keyDetailsView.getElementText(keyDetailsView.jsonKeyValue)
    // Check the added key contains json object with added key
    expect(Common.formatJsonString(jsonValue)).eql(
      '{name:"xyz"key1:"value1"key2:{key2222:12345}}',
      'The json object value not found',
    )
  })

  it('Verify that user can not add invalid JSON structure inside of created JSON', async function () {
    const jsonValues = [
      '{"name": "Joe", "age": null, }',
      '{"name": "Joe", "age": null]',
      '{"name": "Joe", "age": null, }',
    ]
    // Add key with value on the same level
    await keyDetailsView.addJsonKeyOnTheSameLevel('"key1"', '{}')
    for (const value of jsonValues) {
      // Add invalid JSON structure
      await keyDetailsView.addJsonStructure(value)
      // Check the added key contains json object with added key
      expect(await keyDetailsView.getElementText(keyDetailsView.jsonError)).eql(
        'Value should have JSON format.',
        'The json object error not displayed',
      )
      await ButtonActions.clickElement(keyDetailsView.refreshKeyButton)
    }
    // Verify that incorrect syntax error displayed for invalid JSON key
    await keyDetailsView.addJsonKeyOnTheSameLevel('invalidkey', 'InvalidValue')
    expect(await keyDetailsView.getElementText(keyDetailsView.jsonError)).eql(
      'Key should have correct syntax.',
      'The json key error not displayed',
    )
  })

  it('Verify user can delete JSON key', async function () {
    // Add key with value on the same level
    await keyDetailsView.addJsonKeyOnTheSameLevel('"key1"', '{}')
    await ButtonActions.clickElement(keyDetailsView.removeJsonFieldIcon)
    await ButtonActions.clickElement(keyDetailsView.removeJsonFieldConfirmBtn)

    await keyDetailsView.switchBack()
    // Check the notification message that json object deleted
    await NotificationActions.checkNotificationMessage(
      `key1 has been removed from ${keyName}`,
    )

    await keyDetailsView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    await ButtonActions.clickElement(keyDetailsView.removeTrigger)
    await ButtonActions.clickElement(keyDetailsView.removeJsonKeyConfirmBtn)

    await keyDetailsView.switchBack()
    // Check the notification message that json field deleted
    await NotificationActions.checkNotificationMessage(
      `name has been removed from ${keyName}`,
    )

    await keyDetailsView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    await keyDetailsView.removeKeyFromDetailedView()
    await keyDetailsView.switchBack()
    // Check the notification message that key deleted
    await NotificationActions.checkNotificationMessage(
      `${keyName} has been deleted.`,
    )

    // Verify that details panel is closed for zset key after deletion
    await KeyDetailsActions.verifyDetailsPanelClosed()
  })
})

describe('Add JSON Key verification', () => {
  let keyDetailsView: JsonKeyDetailsView
  let treeView: TreeView
  let addJsonKeyView: AddJsonKeyView

  before(async () => {
    keyDetailsView = new JsonKeyDetailsView()
    treeView = new TreeView()
    addJsonKeyView = new AddJsonKeyView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await CliAPIRequests.sendRedisCliCommandApi(
      `FLUSHDB`,
      Config.ossStandaloneConfig,
    )
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can create different types(string, number, null, array, boolean) of JSON', async function () {
    for (let i = 0; i < jsonKeys.length; i++) {
      const jsonKeyParameters: JsonKeyParameters = {
        keyName: jsonKeys[i][0],
        data: jsonKeys[i][1],
      }
      await addJsonKeyView.addKey(jsonKeyParameters, KeyTypesShort.ReJSON)
      await addJsonKeyView.switchBack()
      await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
      await addJsonKeyView.waitForElementVisibility(keyDetailsView.jsonKeyValue)
      // Add additional check for array elements
      if (jsonKeys[i][0].includes('array')) {
        for (const j of JSON.parse(jsonKeys[i][1])) {
          expect(
            Common.formatJsonString(
              await keyDetailsView.getElementText(
                keyDetailsView.getJsonScalarValueByIndex(j),
              ),
            ),
          ).contains(j.toString(), 'JSON value not correct')
        }
      } else {
        expect(
          Common.formatJsonString(
            await keyDetailsView.getElementText(keyDetailsView.jsonKeyValue),
          ),
        ).eql(jsonKeys[i][1], 'JSON value not correct')
      }
      await addJsonKeyView.switchBack()
      // Check the notification message that key added
      await NotificationActions.checkNotificationMessage(`Key has been added`)
      await keyDetailsView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )
      // Verify that key created
      expect(await treeView.isKeyIsDisplayedInTheList(jsonKeys[i][0])).eql(
        true,
        `${jsonKeys[i][0]} key not displayed`,
      )
    }
  })

  it('Verify that user can insert a JSON from .json file on the form to add a JSON key', async function () {
    keyName = Common.generateWord(10)
    await ButtonActions.clickElement(treeView.addKeyButton)

    await addJsonKeyView.switchBack()
    await addJsonKeyView.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await addJsonKeyView.selectKeyTypeByValue(KeyTypesShort.ReJSON)
    await InputActions.typeText(addJsonKeyView.keyNameInput, keyName)
    await InputActions.setFilesToUpload(addJsonKeyView.uploadInput, [filePath])
    await ButtonActions.clickElement(addJsonKeyView.addButton)
    await CommonDriverExtension.driverSleep(5000)
    await addJsonKeyView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
    // Verify that json saved as uploaded
    for (const value of jsonValues) {
      expect(
        await keyDetailsView.getElementText(
          keyDetailsView.getJsonScalarValueByIndex(
            indexOf(jsonValues, value) + 1,
          ),
        ),
      ).contains(value, 'JSON value not correct')
    }

    await addJsonKeyView.switchBack()
    // Check the notification message that key added
    await NotificationActions.checkNotificationMessage(`Key has been added`)
  })
})
