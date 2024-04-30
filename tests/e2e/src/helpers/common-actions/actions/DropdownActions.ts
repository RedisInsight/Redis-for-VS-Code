import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'

/**
 * Dropdowns
 */
export class DropdownActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!DropdownActions.driver) {
      DropdownActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Get dropdown value
   * @param locator checkbox locator
   * @param timeout timeout to wait for element
   */
  static async getDropdownValue(
    locator: Locator,
    timeout: number = 3000,
  ): Promise<string> {
    DropdownActions.initializeDriver()
    const dropdown = await DropdownActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )
    return await dropdown.getAttribute('value')
  }
}
