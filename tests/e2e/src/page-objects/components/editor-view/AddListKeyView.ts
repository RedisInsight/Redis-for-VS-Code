import { By } from 'selenium-webdriver'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { TreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'

/**
 * Add List Key details view
 */
export class AddListKeyView extends AddKeyView {
  listElementInput = By.xpath('//*[@data-testid="element"]')

  getMemberInputByIndex = (index: number): By =>
    By.xpath(`//input[@id="member-${index}"]`)

  /**
   * Adding a new List key
   * @param keyName The name of the key
   * @param element The key element
   * @param TTL The Time to live value of the key
   */
  async addListKey(
    keyName: string,
    element: string = '',
    TTL: string = '',
  ): Promise<void> {
    let treeView = new TreeView()
    await super.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await ButtonActions.clickElement(treeView.addKeyButton)

    await super.switchBack()
    await super.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await super.selectKeyTypeByValue(KeyTypesShort.List)

    if (TTL.length > 0) {
      await InputActions.typeText(this.ttlInput, TTL)
    }

    if (element.length > 0) {
      await InputActions.typeText(this.listElementInput, element)
    }

    await InputActions.typeText(this.keyNameInput, keyName)

    await ButtonActions.clickElement(this.addButton)
    await super.switchBack()
  }
}
