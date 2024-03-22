import { By } from 'selenium-webdriver'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { KeyDetailsView } from './KeyDetailsView'

/**
 * Base view for all keyTypes that have 2 columns value
 */
export class DoubleColumnKeyDetailsView extends KeyDetailsView {
  applyButton = By.xpath(
    '//*[@data-testid="virtual-table-container"]//*[@data-testid="apply-btn"]',
  )
  editButton = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="edit-${keyType}-button-${name}"] | //*[@data-testid="${keyType}-edit-button-${name}"]`,
    )

  /**
   * Edit key value from details
   * @param value The value of the key
   * @param name The field value
   * @param editorLocator The locator of the edit field
   * @param keyType The key type
   */
  protected async editKeyValue(
    value: string,
    name: string,
    editorLocator: By,
    keyType: string,
  ): Promise<void> {
    const editLocator = this.editButton(keyType, name)
    const element = await this.getElement(editLocator)
    await element.click()
    await InputActions.typeText(editorLocator, value)
    await ButtonActions.clickElement(this.applyButton)
  }
}
