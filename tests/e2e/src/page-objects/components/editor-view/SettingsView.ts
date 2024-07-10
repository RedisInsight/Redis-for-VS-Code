import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import { CheckboxActions } from '@e2eSrc/helpers/common-actions'

/**
 * Settings view
 */
export class SettingsView extends WebView {
  switchAnalyticsOption = By.xpath(`//*[@data-testid='check-option-analytics']/..`)
  switchAnalyticsCheckbox = By.xpath(`//input[@data-testid='check-option-analytics']/../../div[contains(@class, 'checkmarkContainer')]`)
  delimiterInput = By.xpath(`//input[@data-testid='input-delimiter']`)

  /**
   * Get state of Analytics switcher
   */
  async getAnalyticsSwitcherValue(): Promise<boolean> {
    const switcherElement = await super.getElement(this.switchAnalyticsOption)
    return await CheckboxActions.getCheckboxState(switcherElement)
  }
}
