import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'

/**
 * Settings view
 */
export class SettingsView extends WebView {
  switchAnalyticsOption = By.xpath(`//*[@data-testid='check-option-analytics']`)
  delimiterInput = By.xpath(`//input[@data-testid='input-delimiter']`)

  /**
   * Get state of Analytics switcher
   */
  async getAnalyticsSwitcherValue(): Promise<boolean> {
    const switcherElement = await super.getElement(this.switchAnalyticsOption)
    return (await switcherElement.getAttribute('current-checked')) === 'true'
  }
}
