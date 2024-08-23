import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import {
  ButtonActions,
  CheckboxActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { InputWithButtons } from '../common/InputWithButtons'

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
  delimiterInput = By.xpath(`//input[@data-testid='input-delimiter']`)

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
    await InputActions.slowType(this.delimiterInput, ':')
    await ButtonActions.clickElement(InputWithButtons.applyInput)
  }
}
