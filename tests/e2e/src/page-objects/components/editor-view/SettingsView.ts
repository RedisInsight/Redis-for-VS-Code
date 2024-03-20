import { By } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'
import { InnerViewLocators, InnerViews } from '@e2eSrc/page-objects/components/WebView'

/**
 * Edit Database view
 */
export class SettingsView extends BaseComponent {
  switchAnalyticsOption = By.xpath(`//*[@data-testid='check-option-analytics']`)
  delimiterInput = By.xpath(`//input[@data-testid='input-delimiter']`)

  constructor() {
    super(By.xpath(InnerViewLocators[InnerViews.SettingsInnerView]))
  }

    /**
     * Get state of Analytics switcher
     */
      async getAnalyticsSwitcherValue(): Promise<boolean> {
        const switcherElement = await this.getElement(this.switchAnalyticsOption)
        return await switcherElement.getAttribute('current-checked') === 'true';
    }
}
