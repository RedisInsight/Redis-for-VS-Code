import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, beforeEach, after, afterEach } from 'vscode-extension-tester'
import {
  CliAPIRequests,
  DatabaseAPIRequests,
  KeyAPIRequests,
} from '@e2eSrc/helpers/api'
import { Common } from '@e2eSrc/helpers/Common'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  TreeView,
  KeyDetailsView,
  HashKeyDetailsView,
  StringKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { formatters, phpData } from '../../test-data/formatters-data'
import {
  keyLength,
  keyTypesShort,
  Formatters,
  KeyTypesShort,
} from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { By, Locator } from 'vscode-extension-tester'
import { CommonDriverExtension } from '@e2eSrc/helpers'

const binaryFormattersSet = [formatters[5], formatters[6], formatters[7]]
const formattersHighlightedSet = [formatters[0], formatters[3]]
const fromBinaryFormattersSet = [
  formatters[1],
  formatters[2],
  formatters[4],
  formatters[8],
  formatters[9],
  formatters[10],
]
const formattersForEditSet = [formatters[0], formatters[1], formatters[3]]
const formattersWithTooltipSet = [
  formatters[0],
  formatters[1],
  formatters[2],
  formatters[3],
  formatters[4],
  formatters[8],
  formatters[9],
  formatters[10],
]
const notEditableFormattersSet = [
  formatters[2],
  formatters[4],
  formatters[8],
  formatters[9],
  formatters[10],
]
const defaultFormatter = Formatters.Unicode

describe('Formatters', () => {
  let keyDetailsView: KeyDetailsView
  let treeView: TreeView
  let hashKeyDetailsView: HashKeyDetailsView
  let stringKeyDetailsView: StringKeyDetailsView

  let keysData = keyTypesShort
    .map((object: any) => ({ ...object }))
    .filter((v: any, i: number) => i <= 6 && i !== 5)
  keysData.forEach(
    (key: { keyName: string }) =>
      (key.keyName =
        `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`),
  )

  async function verifyValueHighlighted(
    highlightedValueSelector: Locator,
    state: boolean = true,
  ): Promise<void> {
    expect(
      await keyDetailsView.isElementDisplayed(highlightedValueSelector),
    ).eql(state, `Value highlighting is not ${state}`)
  }

  before(async () => {
    keyDetailsView = new KeyDetailsView()
    treeView = new TreeView()
    hashKeyDetailsView = new HashKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  beforeEach(async () => {
    keysData = keyTypesShort
      .map((object: any) => ({ ...object }))
      .filter((v: any, i: number) => i <= 6 && i !== 5)
    keysData.forEach(
      (key: { keyName: string }) =>
        (key.keyName =
          `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`),
    )
  })
  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await keyDetailsView.selectFormatter(defaultFormatter)
    await CliAPIRequests.sendRedisCliCommandApi(
      `FLUSHDB`,
      Config.ossStandaloneConfig,
    )
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
  })
  formattersHighlightedSet.forEach(formatter => {
    it(`Verify that user can see highlighted key details in ${formatter.format} format`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
        formatter.fromText,
        formatter.fromText,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )

      // Verify for JSON and PHP serialized
      // Verify for Hash, List, Set, ZSet, String, Stream keys
      for (const key of keysData) {
        const highlightedValueSelector = keyDetailsView.getHighlightedValue(
          key.keyName,
          key.data,
        )
        // Verify that Stream field is formatted and highlighted for JSON and PHP serialized
        // Skip for Stream as not implemented yet
        if (key.keyType === 'stream') {
          //   expect(
          //     await (
          //       await keyDetailsView.getElements(highlightedValueSelector)
          //     ).length,
          //   ).eql(2, `Stream field is not formatted to ${formatter.format}`)
        } else {
          // Open key details iframe
          await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(key.keyName)
          // Verify that value not formatted with default formatter
          await keyDetailsView.selectFormatter(defaultFormatter)
          await verifyValueHighlighted(highlightedValueSelector, false)

          await keyDetailsView.selectFormatter(formatter.format)
          // Verify that value is formatted and highlighted
          await verifyValueHighlighted(highlightedValueSelector)
        }
        await keyDetailsView.switchBack()
        await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      }
    })
  })

  fromBinaryFormattersSet.forEach(formatter => {
    it(`Verify that user can see highlighted key details in ${formatter.format} format`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
        formatter.fromText,
        formatter.fromText,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )

      // Verify for Msgpack, Protobuf, Java serialized, Pickle, Vector 32-bit, Vector 64-bit formats
      // Open Hash key details
      await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
        keysData[0].keyName,
      )
      // Add valid value in HEX format for convertion
      await keyDetailsView.selectFormatter(Formatters.HEX)
      await hashKeyDetailsView.editHashKeyValue(formatter.fromHexText!)
      await keyDetailsView.selectFormatter(formatter.format)
      // Verify that value is formatted and highlighted
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(
        formatter.formattedText!.slice(0, 100),
        `Value is not saved as ${formatter.format}`,
      )
      await verifyValueHighlighted(
        keyDetailsView.getHighlightedValue(
          keysData[0].keyName,
          keysData[0].data,
        ),
      )
    })
  })

  formattersForEditSet.forEach(formatter => {
    it(`Verify that user can edit the values in the key regardless if they are valid in ${formatter.format} format or not`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )

      // Verify for JSON, Msgpack, PHP serialized formatters
      const invalidText = 'invalid text'
      // Open key details and select formatter
      await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
        keysData[0].keyName,
      )
      await keyDetailsView.selectFormatter(formatter.format)
      await hashKeyDetailsView.editHashKeyValue(invalidText)
      await ButtonActions.clickElement(keyDetailsView.saveButton)
      // Verify that invalid value can be saved
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(invalidText, `Invalid ${formatter.format} value is not saved`)
      // Add valid value which can be converted
      await hashKeyDetailsView.editHashKeyValue(formatter.fromText!)
      // Verify that valid value can be saved on edit
      formatter.format === Formatters.PHP
        ? expect(
            await hashKeyDetailsView.getElementText(
              hashKeyDetailsView.hashValuesList,
            ),
          ).contains(
            formatter.formattedText,
            `Valid ${formatter.format} value is not saved`,
          )
        : expect(
            await hashKeyDetailsView.getElementText(
              hashKeyDetailsView.hashValuesList,
            ),
          ).contains(
            formatter.fromText,
            `Valid ${formatter.format} value is not saved`,
          )
      await verifyValueHighlighted(
        keyDetailsView.getHighlightedValue(
          keysData[0].keyName,
          keysData[0].data,
        ),
      )

      await hashKeyDetailsView.editHashKeyValue(formatter.fromTextEdit!)
      // Verify that valid value can be edited to another valid value
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(
        formatter.fromTextEdit,
        `Valid ${formatter.format} value is not saved`,
      )
      await verifyValueHighlighted(
        keyDetailsView.getHighlightedValue(
          keysData[0].keyName,
          keysData[0].data,
        ),
      )

      if (formatter.format === Formatters.JSON) {
        // bigInt can be displayed for JSON format
        await hashKeyDetailsView.editHashKeyValue(formatter.fromBigInt!)
        expect(
          await hashKeyDetailsView.getElementText(
            hashKeyDetailsView.hashValuesList,
          ),
        ).contains(
          formatter.fromBigInt,
          `Valid ${formatter.format} value is not saved`,
        )
      }
    })
  })

  formattersWithTooltipSet.forEach(formatter => {
    it(`Verify that user can see tooltip with convertion failed message on hover when data is not valid ${formatter.format}`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )

      // Verify for JSON, Msgpack, Protobuf, PHP serialized, Java serialized object, Pickle, Vector 32-bit, Vector 64-bit formatters
      for (let i = 0; i < keysData.length; i++) {
        // Open key details and select formatter
        await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
          keysData[i].keyName,
        )
        await keyDetailsView.selectFormatter(formatter.format)
        // Verify that not valid value is not formatted
        await verifyValueHighlighted(
          keyDetailsView.getHighlightedValue(
            keysData[i].keyName,
            keysData[i].data,
          ),
          false,
        )
        // Verify that tooltip with convertion failed message displayed
        // const failedMessage = `Failed to convert to ${formatter.format}`
        // skipped because imposible to test tooltips for now
        await keyDetailsView.switchBack()
        await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      }
    })
  })

  binaryFormattersSet.forEach(formatter => {
    it(`Verify that user can see key details converted to ${formatter.format} format`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
        formatter.fromText,
        formatter.fromText,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )
      // Verify for ASCII, HEX, Binary formatters
      // Verify for Hash, List, Set, ZSet, String, Stream keys
      for (let i = 0; i < keysData.length; i++) {
        // Open key details and select formatter
        await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
          keysData[i].keyName,
        )
        // Verify that value not formatted with default formatter
        await keyDetailsView.selectFormatter(defaultFormatter)
        expect(
          await keyDetailsView.getElementText(
            keyDetailsView.getKeyValue(keysData[i].keyName, keysData[i].data),
          ),
        ).contains(
          formatter.fromText,
          `Value is formatted as ${formatter.format} in Unicode`,
        )
        await keyDetailsView.selectFormatter(formatter.format)
        // Verify that Hash field is formatted to ASCII/HEX/Binary
        if (keysData[i].keyType === KeyTypesShort.Hash) {
          expect(
            await keyDetailsView.getElementText(
              keyDetailsView.getKeyValue(keysData[i].keyName, ''),
            ),
          ).contains(
            formatter.formattedText,
            `Hash field is not formatted to ${formatter.format}`,
          )
        } else {
          // Verify that value is formatted
          expect(
            await keyDetailsView.getElementText(
              keyDetailsView.getKeyValue(keysData[i].keyName, keysData[i].data),
            ),
          ).contains(
            formatter.formattedText,
            `Value is not formatted to ${formatter.format}`,
          )
        }
        await keyDetailsView.switchBack()
        await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      }
    })

    it(`Verify that user can edit value for Hash field in ${formatter.format} and convert then to another format`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )
      // Verify for ASCII, HEX, Binary formatters
      // Open key details and select formatter
      await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(
        keysData[0].keyName,
      )
      await keyDetailsView.selectFormatter(formatter.format)
      // Add value in selected format
      await hashKeyDetailsView.editHashKeyValue(formatter.formattedText!)
      // Verify that value saved in selected format
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(
        formatter.formattedText,
        `${formatter.format} value is not saved`,
      )
      await keyDetailsView.selectFormatter(defaultFormatter)
      // Verify that value converted to Unicode
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(
        formatter.fromText,
        `${formatter.format} value is not converted to Unicode`,
      )
      await keyDetailsView.selectFormatter(formatter.format)
      await hashKeyDetailsView.editHashKeyValue(
        formatter.formattedTextEdit!
      )
      // Verify that valid converted value can be edited to another
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(
        formatter.formattedTextEdit,
        `${formatter.format} value is not saved`,
      )
      await keyDetailsView.selectFormatter(defaultFormatter)
      // Verify that value converted to Unicode
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(
        formatter.fromTextEdit,
        `${formatter.format} value is not converted to Unicode`,
      )
    })
  })

  it('Verify that user can format different data types of PHP serialized', async function () {
    await KeyAPIRequests.addKeysApi(
      keysData,
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    // Open Hash key details
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keysData[0].keyName)
    for (const type of phpData) {
      // Add fields to the hash key
      await keyDetailsView.selectFormatter(Formatters.Unicode)
      await hashKeyDetailsView.addFieldToHash(type.dataType, type.from)
      // Search the added field
      await keyDetailsView.searchByTheValueInKeyDetails(type.dataType)
      await keyDetailsView.selectFormatter(Formatters.PHP)
      // Verify that PHP serialized value is formatted and highlighted
      expect(
        await hashKeyDetailsView.getElementText(
          hashKeyDetailsView.hashValuesList,
        ),
      ).contains(type.converted, `Value is not saved as PHP ${type.dataType}`)
      await verifyValueHighlighted(
        keyDetailsView.getHighlightedValue(
          keysData[0].keyName,
          keysData[0].data,
        ),
      )
      await keyDetailsView.clearSearchInKeyDetails()
    }
  })

  notEditableFormattersSet.forEach(formatter => {
    it(`Verify that user see edit icon disabled for all keys when ${formatter.format} selected`, async function () {
      await KeyAPIRequests.addKeysApi(
        keysData,
        Config.ossStandaloneConfig.databaseName,
      )
      // Refresh database
      await treeView.refreshDatabaseByName(
        Config.ossStandaloneConfig.databaseName,
      )
      // Verify for Protobuf, Java serialized, Pickle, Vector 32-bit, Vector 64-bit
      // Verify for Hash, List, ZSet, String keys
      for (const key of keysData) {
        const editBtnLocator = By.xpath(
          `//vscode-button[contains(@data-testid, 'edit-') and contains(@data-testid, '${key.keyName.split('-')[0]}')]`,
        )

        if (
          key.keyType === KeyTypesShort.Hash ||
          key.keyType === KeyTypesShort.List ||
          key.keyType === KeyTypesShort.String
        ) {
          const editBtn =
            key.keyType === KeyTypesShort.String
              ? stringKeyDetailsView.editKeyValueButton
              : editBtnLocator
          await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(key.keyName)
          await keyDetailsView.selectFormatter(formatter.format)
          await CommonDriverExtension.driverSleep(300)
          // Verify that edit button disabled for Hash, List, String keys
          expect(await keyDetailsView.isElementDisabled(editBtn, 'class')).eql(
            true,
            `Key ${key.keyType} is enabled for ${formatter.format} formatter`,
          )
          // Hover on disabled button
          // Verify tooltip content
          // skipped because imposible to test tooltips for now
        }

        if (key.keyType === KeyTypesShort.ZSet) {
          await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(key.keyName)
          await keyDetailsView.selectFormatter(formatter.format)
          // Verify that edit button enabled for ZSet
          expect(
            await keyDetailsView.isElementDisabled(editBtnLocator, 'class'),
          ).eql(
            false,
            `Key ${key.textType} is disabled for ${formatter.format} formatter`,
          )
        }
        await keyDetailsView.switchBack()
        await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
      }
    })
  })
})
