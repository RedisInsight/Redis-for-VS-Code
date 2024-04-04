import { By } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { ViewLocators, Views } from '@e2eSrc/page-objects/components/WebView'
import { InputWithButtons } from '../InputWithButtons'

/**
 * Key details view
 */
export class KeyDetailsView extends BaseComponent {
  inlineItemEditor = By.xpath(`//*[@data-testid='inline-item-editor']`)
  keyType = By.xpath(`//div[contains(@class, '_keyFlexGroup')]`)
  keySize = By.xpath(`//div[@data-testid='key-size-text']`)
  keyLength = By.xpath(`//div[@data-testid='key-length-text']`)
  refreshKeyButton = By.xpath(`//*[@data-testid='refresh-key-btn']`)
  applyBtn = By.xpath(
    `//*[@class='key-details-body']//*[@data-testid='apply-btn']`,
  )
  searchInput = By.xpath(`//*[@data-testid='search']`)
  clearSearchInput = By.xpath(`//*[@data-testid='decline-search-button']`)
  setMemberInput = By.xpath(`//*[@data-testid='member-name']`)
  keyNameInput = By.xpath(`//*[@data-testid='edit-key-input']`)
  copyKeyNameBtn = By.xpath(`//*[@data-testid='copy-name-button']`)
  // BUTTONS
  searchButtonInKeyDetails = By.xpath(
    `//vscode-button[@data-testid='search-button']`,
  )
  addKeyValueItemsButton = By.xpath(
    `//*[@data-testid = 'add-key-value-items-btn']`,
  )
  copyButton = By.xpath(
    `//vscode-button[starts-with(@data-testid, 'copy-name-button')]`,
  )
  detailsDeleteKeyButton = By.xpath(
    `//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  submitDetailsDeleteKeyButton = By.xpath(
    `//div[@class='popup-content ']${this.detailsDeleteKeyButton}`,
  )
  saveMemberButton = By.xpath(`//*[@data-testid='save-members-btn']`)

  trashIcon = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="remove-${keyType}-button-${name}-icon"] | //*[@data-testid="${keyType}-remove-button-${name}-icon"] | //*[@data-testid="${keyType}-remove-btn-${name}-icon"]`,
    )

  commonTrashIcon = (keyType: string): By =>
    By.xpath(
      `//*[contains(@data-testid,"${keyType}-remove-btn-")] | //*[contains(@data-testid,"${keyType}-remove-button-")]`,
    )
  commonRemoveButton = (keyType: string): By =>
    By.xpath(
      `//*[contains(@data-testid, "${keyType}-remove-btn-") and not(contains(@data-testid, "-icon"))] | //*[contains(@data-testid, "${keyType}-remove-button-") and not(contains(@data-testid, "-icon"))]`,
    )
  removeButton = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="remove-${keyType}-button-${name}"] | //*[@data-testid="${keyType}-remove-button-${name}"]`,
    )

  constructor() {
    super(By.xpath(ViewLocators[Views.KeyDetailsView]))
  }

  /**
   * get key size
   */
  async getKeySize(): Promise<number> {
    const keySizeText = await this.getElementText(this.keySize)
    const regex = /Key Size: (\d+)/
    const match = keySizeText.match(regex)
    return match ? parseInt(match[1], 10) : NaN
  }

  /**
   * get key length
   */
  async getKeyLength(): Promise<number> {
    const keyLengthText = await this.getElementText(this.keyLength)
    const regex = /Length: (\d+)/
    const match = keyLengthText.match(regex)
    return match ? parseInt(match[1], 10) : NaN
  }

  /**
   * Search by the value in the key details
   * @param value The value of the search parameter
   */
  async searchByTheValueInKeyDetails(value: string): Promise<void> {
    if (!(await this.isElementDisplayed(this.searchInput))) {
      await ButtonActions.clickAndWaitForElement(
        this.searchButtonInKeyDetails,
        this.searchInput,
      )
    }
    const inputField = await this.getElement(this.searchInput)
    await InputActions.typeText(this.searchInput, value)
    await InputActions.pressKey(inputField, 'enter')
    await CommonDriverExtension.driverSleep(1000)
  }

  /**
   * Clear search input in key details table
   */
  async clearSearchInKeyDetails(): Promise<void> {
    if (!(await this.isElementDisplayed(this.searchInput))) {
      await ButtonActions.clickAndWaitForElement(
        this.searchButtonInKeyDetails,
        this.searchInput,
      )
    }
    const inputField = await this.getElement(this.searchInput)
    await ButtonActions.clickElement(this.clearSearchInput)
    await InputActions.pressKey(inputField, 'enter')
    await CommonDriverExtension.driverSleep(1000)
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
   * Click on copy button
   */
  async clickCopyKeyName(): Promise<void> {
    const element = await this.getElement(this.copyButton)
    await element.click()
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
   * Remove the first row
   * @param keyType The key type
   */
  async removeFirstRow(keyType: string): Promise<void> {
    const rowInTheListLocator = this.commonTrashIcon(keyType)
    const element = await this.getElement(rowInTheListLocator)
    await element.click()
    const removeLocator = this.commonRemoveButton(keyType)
    const element2 = await this.getElement(removeLocator)
    await element2.click()
  }
  /**
   * Remove multiple rows in key by field values
   * @param keyType The key type
   * @param names The field values
   */
  async removeRowsByFieldValues(
    keyType: string,
    names: string[],
  ): Promise<void> {
    for (const name of names) {
      await this.removeRowByField(keyType, name)
      await this.clickRemoveRowButtonByField(keyType, name)
    }
  }

  /**
   * Remove key from key details
   */
  async removeKeyFromDetailedView(): Promise<void> {
    await (await this.getElement(this.detailsDeleteKeyButton)).click()
    await (await this.getElement(this.submitDetailsDeleteKeyButton)).click()
  }

  /**
   * Edit key name from details
   * @param keyName The name of the key
   */
  async editKeyName(keyName: string): Promise<void> {
    await (await this.getElement(this.keyNameInput)).click()
    await InputActions.slowType(this.keyNameInput, keyName)
    await (await this.getElement(InputWithButtons.applyInput)).click()
  }
}