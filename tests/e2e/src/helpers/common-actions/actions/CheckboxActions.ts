import { VSBrowser, WebDriver, WebElement } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'

/**
 * Checkboxes
 */
export class CheckboxActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!CheckboxActions.driver) {
      CheckboxActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Get checkbox state
   * @param locator checkbox locator
   * @param timeout timeout to wait for element
   */
  static async getCheckboxState(element: WebElement): Promise<boolean> {
    return (await element.getAttribute('current-checked')) === 'true'
  }

  /**
   * Toggle checkbox
   * @param locator checkbox locator
   * @param timeout timeout to wait for element
   */
  static async toggleCheckbox(
    locator: Locator,
    desiredState: boolean = true,
    timeout: number = 3000,
  ): Promise<void> {
    CheckboxActions.initializeDriver()
    const checkbox = await CheckboxActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )
    const currentState = await this.getCheckboxState(checkbox)
    if (currentState !== desiredState) {
      await checkbox.click()
    }
  }
}
