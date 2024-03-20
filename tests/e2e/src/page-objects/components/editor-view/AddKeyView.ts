import { By } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

/**
 * Add Key details view
 */
export class AddKeyView extends BaseComponent {
  keyTypeDropdown = By.xpath('//*[@data-testid="select-key-type"]')
  ttlInput = By.xpath('//*[@data-testid="ttl-input"]')
  keyNameInput = By.xpath('//*[@data-testid="key-input"]')

  /**
   * Select key type
   * @param value The type of the key
   */
  async selectKeyTypeByValue(value: KeyTypesShort): Promise<void> {
    const dropdown = await this.getElement(this.keyTypeDropdown)
    await dropdown.click()

    // should be fixed after adding more types
    const optionLocator = By.xpath(`//*[@value='${value}']`)
    const option = await this.getElement(optionLocator)
    await option.click()
  }
}
