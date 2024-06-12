import { By } from 'selenium-webdriver'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { TreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'

/**
 * Add Hash Key details view
 */
export class AddHashKeyView extends AddKeyView {
  listElementInput = By.xpath(`//input[starts-with(@data-testid, 'hash-field-')]`)

  getMemberInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="hash-field-${index}"]`)

  /**
   * Adding a new Hash key
   * @param keyName The name of the key
   * @param TTL The Time to live value of the key
   * @param field The field name of the key
   * @param value The value of the key
   */
  async addHashKey(
    keyName: string, TTL = '', field = '', value = '',
  ): Promise<void> {
    let treeView = new TreeView()
    await super.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await ButtonActions.clickElement(treeView.addKeyButton)

    await super.switchBack()
    await super.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await super.selectKeyTypeByValue(KeyTypesShort.Hash)

    if (TTL.length > 0) {
      await InputActions.typeText(this.ttlInput, TTL)
    }

    if (field.length > 0) {
      await InputActions.typeText(this.listElementInput, field)
    }

    await InputActions.typeText(this.keyNameInput, keyName)

    await ButtonActions.clickElement(this.addButton)
    await super.switchBack()
  }
}
