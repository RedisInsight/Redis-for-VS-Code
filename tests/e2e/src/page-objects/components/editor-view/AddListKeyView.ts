import { By } from 'selenium-webdriver'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { TreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { ListKeyParameters } from '@e2eSrc/helpers/types/types'
import { CommonDriverExtension } from '@e2eSrc/helpers'

/**
 * Add List Key details view
 */
export class AddListKeyView extends AddKeyView {
  listElementInput = By.xpath('//*[@data-testid="element"]')

  /**
   * Adding a new List key
   * @param keyParameters The list key parameters
   * @param TTL The Time to live value of the key
   */
  async addListKey(
    keyParameters: ListKeyParameters,
    TTL: string = '',
  ): Promise<void> {
    let treeView = new TreeView()

    await ButtonActions.clickElement(treeView.addKeyButton)

    await super.switchBack()
    await super.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await super.selectKeyTypeByValue(KeyTypesShort.List)

    if (TTL.length > 0) {
      await InputActions.typeText(this.ttlInput, TTL)
    }

    if (keyParameters.element.length > 0) {
      await InputActions.typeText(this.listElementInput, keyParameters.element)
    }

    await InputActions.typeText(this.keyNameInput, keyParameters.keyName)

    await ButtonActions.clickElement(this.addButton)
    await super.switchBack()
    await CommonDriverExtension.driverSleep(1000)
  }
}
