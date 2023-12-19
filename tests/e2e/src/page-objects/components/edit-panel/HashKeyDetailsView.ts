import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'
import { ButtonsActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

/**
 * Hash Key details view
 */
export class HashKeyDetailsView extends KeyDetailsView {
  searchButtonInKeyDetails = By.xpath(
    `//vscode-button[@data-testid='search-button']`,
  )
  clearSearchInput = By.xpath(`//*[@data-testid='decline-search-button']`)
  searchInput = By.xpath(`//*[@data-testid='search']`)
  hashFieldsList = By.xpath(
    `//*[contains(@data-testid, 'hash-field-') and not(contains(@data-testid,'value'))]/div`,
  )
  hashValuesList = By.xpath(
    `//*[contains(@data-testid, 'hash-field-value-')]/div`,
  )
  hashFieldValueEditor = By.xpath(`//*[@data-testid = 'hash-value-editor']`)
  applyButton = By.xpath(
    '//*[@data-testid="virtual-table-container"]//*[@data-testid="apply-btn"]',
  )

  trashMask = '//*[@data-testid="remove-hash-button-$name-icon"]'
  removeMask = '//*[@data-testid="remove-hash-button-$name"]'
  editHashButtonMask = '//*[@data-testid="edit-hash-button-$name"]'

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
   * Open key details of the key by name
   * @param name The field value
   */
  async removeRowByField(name: string): Promise<void> {
    const rowInTheListLocator = By.xpath(
      this.trashMask.replace(/\$name/g, name),
    )
    const element = await this.getElement(rowInTheListLocator)
    await element.click()
  }

  /**
   * Open key details of the key by name
   * @param name The field value
   */
  async clickRemoveRowButtonByField(name: string): Promise<void> {
    const removeLocator = By.xpath(this.removeMask.replace(/\$name/g, name))
    const element = await this.getElement(removeLocator)
    await element.click()
  }

  /**
   * Edit Hash key value from details
   * @param value The value of the key
   * @param name The field value
   */
  async editHashKeyValue(value: string, name: string): Promise<void> {
    const editLocator = By.xpath(
      this.editHashButtonMask.replace(/\$name/g, name),
    )
    const element = await this.getElement(editLocator)
    await element.click()
    const editElement = await this.getElement(this.hashFieldValueEditor)
    await editElement.clear()
    await editElement.sendKeys(value)
    await ButtonsActions.clickElement(this.applyButton)
  }
}
