import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'

/**
 * String Key details view
 */
export class StringKeyDetailsView extends KeyDetailsView {
  stringKeyValueInput = By.xpath(`//*[@data-testid='string-value']`)
  // BUTTONS
  loadAllBtn = By.xpath(`//*[@data-testid='load-all-value-btn']`)
  editKeyValueButton = By.xpath(`//vscode-button[@data-testid='edit-key-value-btn']`)
  downloadAllValueBtn = By.xpath(`//*[@data-testid='download-all-value-btn']`)

  //Get String key value from details
  async getStringKeyValue(): Promise<string> {
    return await super.getElementText(this.stringKeyValueInput)
  }
}
