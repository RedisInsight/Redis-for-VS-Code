import { By } from 'selenium-webdriver'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { WebView } from '../WebView'
import { ButtonActions } from '@e2eSrc/helpers/common-actions'

/**
 * Add Key details view
 */
export class AddKeyView extends WebView {
  keyTypeDropdown = By.xpath('//*[@data-testid="select-key-type"]')
  ttlInput = By.xpath('//*[@data-testid="ttl-input"]')
  keyNameInput = By.xpath('//*[@data-testid="key-input"]')
  addButton = By.xpath('//*[@data-testid="btn-add"] | //*[@data-testid="save-fields-btn"]')
  addNewItemBtn = By.xpath(`//*[@data-testid='add-new-item']`)
  saveMembersButton = By.xpath('//*[@data-testid="save-members-btn"]')

  /**
   * Select key type
   * @param value The type of the key
   */
  async selectKeyTypeByValue(value: KeyTypesShort): Promise<void> {
    await ButtonActions.clickElement(this.keyTypeDropdown)

    // should be fixed after adding more types
    const optionLocator = By.xpath(`//*[@value='${value}']`)
    await ButtonActions.clickElement(optionLocator)
  }
}
