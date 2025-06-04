import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import {
  ButtonActions,
  CheckboxActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'

/**
 * Settings view
 */
export class SettingsView extends WebView {
  switchAnalyticsOption = By.xpath(
    `//*[@data-testid='check-option-analytics']/..`,
  )
  switchAnalyticsCheckbox = By.xpath(
    `//input[@data-testid='check-option-analytics']/../../div[contains(@class, 'checkmarkContainer')]`,
  )
  delimiterComboboxInput = By.xpath(`//input[@id='select-multi-delimiters']`)
  applyDelimiterButton = By.xpath(`//*[@data-testid='apply-delimiter-btn']`)
  removeDelimiterIcon = By.xpath(
    `//div[contains(@class, "multiValue_")]/div[@role='button']`,
  )

  /**
   * Get Delimiter badge selector by title
   * @param delimiterTitle title of the delimiter item
   */
  getDelimiterBadgeByTitle = (delimiterTitle: string): By =>
    By.xpath(
      `//*[contains(text(), '${delimiterTitle}')]/parent::div[contains(@class, "multiValue_")]`,
    )

  /**
   * Get Delimiter close button selector by title
   * @param delimiterTitle title of the delimiter item
   */
  getDelimiterCloseBtnByTitle = (delimiterTitle: string): By =>
    By.xpath(
      `//*[contains(text(), '${delimiterTitle}')]/parent::div[contains(@class, "multiValue_")]/div[@role='button']`,
    )

  /**
   * Get state of Analytics switcher
   */
  async getAnalyticsSwitcherValue(): Promise<boolean> {
    const switcherElement = await super.getElement(this.switchAnalyticsOption)
    return await CheckboxActions.getCheckboxState(switcherElement)
  }

  /**
   * Set delimiter default value
   */
  async setDelimiterDefaultValue(): Promise<void> {
    await this.changeDelimiterInTreeView(':')
  }

  /**
   * Add new delimiter
   * @param delimiterName name of the delimiter item
   */
  async addDelimiterItem(delimiterName: string): Promise<void> {
    await ButtonActions.clickElement(this.delimiterComboboxInput)
    await InputActions.slowType(this.delimiterComboboxInput, delimiterName)
    await InputActions.pressKey(this.delimiterComboboxInput, 'enter')
    await ButtonActions.clickElement(this.applyDelimiterButton)
  }

  /**
   * Delete existing delimiter
   * @param delimiterName name of the delimiter item
   */
  async removeDelimiterItem(delimiterName: string): Promise<void> {
    await ButtonActions.clickElement(
      this.getDelimiterCloseBtnByTitle(delimiterName),
    )
  }

  /**
   * Remove all existing delimiters in combobox
   */
  async clearDelimiterCombobox(): Promise<void> {
    while (await super.isElementDisplayed(this.removeDelimiterIcon)) {
      await ButtonActions.clickElement(this.removeDelimiterIcon)
    }
  }

  /**
   * Change delimiter value
   * @param delimiter string with delimiter value
   */
  async changeDelimiterInTreeView(delimiter: string): Promise<void> {
    await this.clearDelimiterCombobox()
    await this.addDelimiterItem(delimiter)
  }
}
