import { By } from 'selenium-webdriver'
import {
  ViewLocators,
  Views,
  WebView,
} from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { TreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/edit-panel/AddKeyView'

/**
 * Add Key details view
 */
export class AddSetKeyView extends AddKeyView {
  addMember = By.xpath(`//*[@data-testid='add-new-item']`)
  addButton = By.xpath('//*[@data-testid="save-members-btn"]')

  memberInputByIndex = (index: number): By =>
    By.xpath(`//input[@id="member-${index}"]`)

  constructor() {
    super(By.xpath(ViewLocators[Views.KeyDetailsView]))
  }

  /**
   * Create string key
   * @param name The name of the key
   * @param value The type of the key
   * @param ttl The ttl of the key
   */
  async addSetKey(
    name: string,
    values: string[] = [],
    ttl: string = '',
  ): Promise<void> {
    let webView = new WebView()
    let treeView = new TreeView()
    await webView.switchToFrame(Views.TreeView)
    await ButtonActions.clickElement(treeView.addKeyButton)

    await webView.switchBack()
    await webView.switchToFrame(Views.AddKeyView)
    await this.selectKeyTypeByValue(KeyTypesShort.Set)

    if (ttl.length > 0) {
      await InputActions.typeText(this.ttlInput, ttl)
    }

    if (values.length > 0) {
      await InputActions.typeText(this.memberInputByIndex(0), values[0])
      if (values.length > 1) {
        values.shift()
        let i = 1
        for (const value of values) {
          await ButtonActions.clickElement(this.addMember)
          await InputActions.typeText(this.memberInputByIndex(i), value)
        }
      }
    }
    await InputActions.typeText(this.keyNameInput, name)

    await ButtonActions.clickElement(this.addButton)
    await webView.switchBack()
  }
}
