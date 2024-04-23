import { By } from 'selenium-webdriver'
import { ButtonActions, DropdownActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import { InputWithButtons } from '../common/InputWithButtons'
import { Key } from 'vscode-extension-tester'
import { Formatters } from '@e2eSrc/helpers/constants'

/**
 * Key details view
 */
export class KeyDetailsView extends WebView {
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
    `//div[@class='popup-content ']//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  saveMemberButton = By.xpath(`//*[@data-testid='save-members-btn']`)
  formatSwitcher = By.xpath(`//*[@data-testid='select-format-key-value']`)
  saveButton = By.xpath(`//vscode-button[@data-testid='save-btn']`)

  getTrashIcon = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="remove-${keyType}-button-${name}-icon"] 
      | //*[@data-testid="${keyType}-remove-button-${name}-icon"] 
      | //*[@data-testid="${keyType}-remove-btn-${name}-icon"]
      | //*[@data-testid="remove-${keyType}-button-${name}-trigger"]`,
    )
  getCommonTrashIcon = (keyType: string): By =>
    By.xpath(
      `//*[contains(@data-testid,"${keyType}-remove-btn-")] | //*[contains(@data-testid,"${keyType}-remove-button-")]`,
    )
  getCommonRemoveButton = (keyType: string): By =>
    By.xpath(
      `//*[contains(@data-testid, "${keyType}-remove-btn-") and not(contains(@data-testid, "-icon"))] | //*[contains(@data-testid, "${keyType}-remove-button-") and not(contains(@data-testid, "-icon"))]`,
    )
  getRemoveButton = (keyType: string, name: string): By =>
    By.xpath(
      `//*[@data-testid="remove-${keyType}-button-${name}"] | //*[@data-testid="${keyType}-remove-button-${name}"]`,
    )
  getFormatterOption = (formatter: string): By =>
    By.xpath(`//vscode-option[@data-testid="format-option-${formatter}"]`)
  getKeyValue = (keyName: string, columnName: string): By =>
    By.xpath(`//*[@data-testid[starts-with(., '${keyName.split('-')[0]}-') and contains(., '${columnName}')]]
    | //*[@data-testid[starts-with(., '${keyName.split('-')[0]}-field-') and contains(., '${columnName}')]]`)
  getHighlightedValue = (keyName: string, columnName: string): By =>
    By.xpath(`//*[@data-testid[starts-with(., '${keyName.split('-')[0]}-') and contains(., '${columnName}')]]//*[@data-testid='value-as-json']
    | //*[@data-testid[starts-with(., '${keyName.split('-')[0]}-field-') and contains(., '${columnName}')]]//*[@data-testid='value-as-json']`)

  /**
   * get key size
   */
  async getKeySize(): Promise<number> {
    const keySizeText = await super.getElementText(this.keySize)
    const regex = /Key Size: (\d+)/
    const match = keySizeText.match(regex)
    return match ? parseInt(match[1], 10) : NaN
  }

  /**
   * get key length
   */
  async getKeyLength(): Promise<number> {
    const keyLengthText = await super.getElementText(this.keyLength)
    const regex = /Length: (\d+)/
    const match = keyLengthText.match(regex)
    return match ? parseInt(match[1], 10) : NaN
  }

  /**
   * Search by the value in the key details
   * @param value The value of the search parameter
   */
  async searchByTheValueInKeyDetails(value: string): Promise<void> {
    if (!(await super.isElementDisplayed(this.searchInput))) {
      await ButtonActions.clickAndWaitForElement(
        this.searchButtonInKeyDetails,
        this.searchInput,
      )
    }
    const inputField = await super.getElement(this.searchInput)
    await InputActions.typeText(this.searchInput, value)
    await InputActions.pressKey(inputField, 'enter')
    await CommonDriverExtension.driverSleep(1000)
  }

  /**
   * Clear search input in key details table
   */
  async clearSearchInKeyDetails(): Promise<void> {
    if (!(await super.isElementDisplayed(this.searchInput))) {
      await ButtonActions.clickAndWaitForElement(
        this.searchButtonInKeyDetails,
        this.searchInput,
      )
    }
    const inputField = await super.getElement(this.searchInput)
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
    const removeLocator = this.getRemoveButton(keyType, name)
    await ButtonActions.clickElement(removeLocator)
  }

  /**
   * Click on copy button
   */
  async clickCopyKeyName(): Promise<void> {
    await ButtonActions.clickElement(this.copyButton)
  }

  /**
   * Remove row by field
   * @param keyType The key type
   * @param name The field value
   */
  async removeRowByField(keyType: string, name: string): Promise<void> {
    const rowInTheListLocator = this.getTrashIcon(keyType, name)
    await ButtonActions.clickElement(rowInTheListLocator)
  }

  /**
   * Remove the first row
   * @param keyType The key type
   */
  async removeFirstRow(keyType: string): Promise<void> {
    const rowInTheListLocator = this.getCommonTrashIcon(keyType)
    await ButtonActions.clickElement(rowInTheListLocator)
    const removeLocator = this.getCommonRemoveButton(keyType)
    await ButtonActions.clickElement(removeLocator)
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
    await ButtonActions.clickElement(this.detailsDeleteKeyButton)
    await ButtonActions.clickElement(this.submitDetailsDeleteKeyButton)
  }

  /**
   * Edit key name from details
   * @param keyName The name of the key
   */
  async editKeyName(keyName: string): Promise<void> {
    await ButtonActions.clickElement(this.keyNameInput)
    await InputActions.slowType(this.keyNameInput, keyName)
    await ButtonActions.clickElement(InputWithButtons.applyInput)
  }

  /**
   * Open formatter dropdown and select option
   * @param formatter The name of formatter
   */
  async selectFormatter(formatter: string): Promise<void> {
    await ButtonActions.clickElement(this.formatSwitcher)
    const dropdownElement = await this.getElement(this.formatSwitcher)
    let currentValue = await DropdownActions.getDropdownValue(this.formatSwitcher)

    // Navigate up in the dropdown until "Unicode" is selected
    while (currentValue !== Formatters.Unicode) {
      await dropdownElement.sendKeys(Key.ARROW_UP)
      currentValue = await DropdownActions.getDropdownValue(this.formatSwitcher)
    }

    // Select the specified formatter
    while (currentValue !== formatter) {
      await dropdownElement.sendKeys(Key.ARROW_DOWN)
      currentValue = await DropdownActions.getDropdownValue(this.formatSwitcher)
    }
    await ButtonActions.clickElement(this.getFormatterOption(formatter))
  }
}
