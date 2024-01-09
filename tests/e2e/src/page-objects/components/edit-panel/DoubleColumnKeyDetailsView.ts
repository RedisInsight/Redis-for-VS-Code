import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'
import { ButtonsActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

/**
 * Base view for all keyTypes that have 2 columns value
 */
export class DoubleColumnKeyDetailsView extends KeyDetailsView {
  searchButtonInKeyDetails = By.xpath(
    `//vscode-button[@data-testid='search-button']`,
  )
  clearSearchInput = By.xpath(`//*[@data-testid='decline-search-button']`)
  searchInput = By.xpath(`//*[@data-testid='search']`)

  applyButton = By.xpath(
    '//*[@data-testid="virtual-table-container"]//*[@data-testid="apply-btn"]',
  )

  trashIcon = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="remove-${keyType}-button-${name}-icon"] | //*[@data-testid="${keyType}-remove-button-${name}-icon"]`,
    )
  removeButton = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="remove-${keyType}-button-${name}"] | //*[@data-testid="${keyType}-remove-button-${name}"]`,
    )
  editButton = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="edit-${keyType}-button-${name}"] | //*[@data-testid="${keyType}-edit-button-${name}"]`,
    )

  /**
   * Search by the value in the key details
   * @param value The value of the search parameter
   */
  async searchByTheValueInKeyDetails(value: string): Promise<void> {
    if (!(await this.isElementDisplayed(this.searchInput))) {
      await ButtonsActions.clickAndWaitForElement(
        this.searchButtonInKeyDetails,
        this.searchInput,
      )
    }
    const inputField = await this.getElement(this.searchInput)
    await inputField.sendKeys(value)
    await InputActions.pressKey(inputField, 'enter')
    await CommonDriverExtension.driverSleep(1000)
  }

  /**
   * Remove row by field
   * @param keyType The key type
   * @param name The field value
   */
  async removeRowByField(keyType: string, name: string): Promise<void> {
    const rowInTheListLocator = this.trashIcon(keyType, name)
    const element = await this.getElement(rowInTheListLocator)
    await element.click()
  }

  /**
   * Click on remove button by field
   * @param keyType The key type
   * @param name The field value
   */
  async clickRemoveRowButtonByField(
    keyType: string,
    name: string,
  ): Promise<void> {
    const removeLocator = this.removeButton(keyType, name)
    const element = await this.getElement(removeLocator)
    await element.click()
  }

  /**
   * Remove multiple rows in key by field values
   * @param keyType The key type
   * @param names The field values
   */
  async removeRowsByFieldValues(keyType: string, names: string[]): Promise<void> {
    for (const name of names) {
      await this.removeRowByField(keyType, name)
      await this.clickRemoveRowButtonByField(keyType, name)
    }
  }

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
    const editElement = await this.getElement(editorLocator)
    await editElement.clear()
    await editElement.sendKeys(value)
    await ButtonsActions.clickElement(this.applyButton)
  }
}
