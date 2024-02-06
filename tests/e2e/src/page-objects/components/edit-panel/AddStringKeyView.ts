import { By } from 'selenium-webdriver'
import {
  ViewLocators,
  Views,
  WebView,
} from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { KeyTreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/edit-panel/AddKeyView'

/**
 * Add Key details view
 */
export class AddStringKeyView extends AddKeyView {
  ttlInput = By.xpath('//*[@data-testid="ttl-input"]')
  keyNameInput = By.xpath('//*[@data-testid="key-input"]')
  stringValueInput = By.xpath('//*[@data-testid="string-value"]')
  addButton = By.xpath('//*[@data-testid="btn-add"]')

  constructor() {
    super(By.xpath(ViewLocators[Views.KeyDetailsView]))
  }
  /**
   * Create string key
   * @param value The type of the key
   */
  async createStringKey(
    name: string,
    value: string = '',
    ttl: string = '',
  ): Promise<void> {
    let webView = new WebView()
    let keyTreeView = new KeyTreeView()
    await webView.switchToFrame(Views.KeyTreeView)
    await ButtonActions.clickElement(keyTreeView.addKeyButton)

    await webView.switchBack()
    await webView.switchToFrame(Views.AddKeyView)
    await this.selectKeyTypeByValue(KeyTypesShort.String)

    if (ttl.length > 0) {
      const ttlInput = await this.getElement(this.ttlInput)
      await ttlInput.sendKeys(ttl)
    }

    if (value.length > 0) {
      const valueInput = await this.getElement(this.stringValueInput)
      await valueInput.sendKeys(value)
    }

    const nameInput = await this.getElement(this.keyNameInput)
    await nameInput.sendKeys(name)

    await ButtonActions.clickElement(this.addButton)
    await webView.switchBack()
  }
}
