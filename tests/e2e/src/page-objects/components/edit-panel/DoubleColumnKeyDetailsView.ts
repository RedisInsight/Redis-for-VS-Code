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
   * @param name The field value
   */
  protected async removeRowByField(
    name: string,
    trashIcon: (name: string) => By,
  ): Promise<void> {
    const rowInTheListLocator = trashIcon(name)
    const element = await this.getElement(rowInTheListLocator)
    await element.click()
  }

  /**
   * Click on remove button by field
   * @param name The field value
   * @param removeButton function to initialize By
   */
  protected async clickRemoveRowButtonByField(
    name: string,
    removeButton: (name: string) => By,
  ): Promise<void> {
    const removeLocator = removeButton(name)
    const element = await this.getElement(removeLocator)
    await element.click()
  }

  /**
   * Edit Hash key value from details
   * @param value The value of the key
   * @param name The field value
   * @param editHashButton function to initialize By
   */
  protected async editKeyValue(
    value: string,
    name: string,
    editorLocator: By,
    editButton: (name: string) => By,
  ): Promise<void> {
    const editLocator = editButton(name)
    console.log('aaaa')
    console.log(editLocator)
    const element = await this.getElement(editLocator)
    await element.click()
    const editElement = await this.getElement(editorLocator)
    await editElement.clear()
    await editElement.sendKeys(value)
    await ButtonsActions.clickElement(this.applyButton)
  }
}
