import { By } from 'selenium-webdriver'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { TreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'
import { CommonDriverExtension } from '@e2eSrc/helpers'

/**
 * Add Hash Key details view
 */
export class AddHashKeyView extends AddKeyView {
  hashFieldNameInput = By.xpath(
    `//input[starts-with(@data-testid, 'hash-field-')]`,
  )
  hashFieldValueInput = By.xpath(
    `//input[starts-with(@data-testid, 'hash-value-')]`,
  )

  getFieldInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="hash-field-${index}"]`)

  getFieldValueInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="hash-value-${index}"]`)

  /**
   * Adding a new Hash key
   * @param keyParameters The hash key parameters
   * @param TTL The Time to live value of the key
   */
  async addHashKey(
    keyParameters: HashKeyParameters,
    TTL = '',
  ): Promise<void> {
    let treeView = new TreeView()

    await ButtonActions.clickElement(treeView.addKeyButton)

    await super.switchBack()
    await super.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await super.selectKeyTypeByValue(KeyTypesShort.Hash)

    if (TTL.length > 0) {
      await InputActions.typeText(this.ttlInput, TTL)
    }

    if (keyParameters.fields.length > 0) {
      await InputActions.typeText(
        this.getFieldInputByIndex(0),
        keyParameters.fields[0].field,
      )
      await InputActions.typeText(
        this.getFieldValueInputByIndex(0),
        keyParameters.fields[0].value,
      )
      if (keyParameters.fields.length > 1) {
        keyParameters.fields.shift()
        let i = 1
        for (const field of keyParameters.fields) {
          await ButtonActions.clickElement(this.addNewItemBtn)
          await InputActions.typeText(this.getFieldInputByIndex(i), field.field)
          await InputActions.typeText(
            this.getFieldValueInputByIndex(i),
            field.value,
          )
          i++
        }
      }
    }

    await InputActions.typeText(this.keyNameInput, keyParameters.keyName)

    await ButtonActions.clickElement(this.addButton)
    await super.switchBack()
    await CommonDriverExtension.driverSleep(1000)
  }
}
