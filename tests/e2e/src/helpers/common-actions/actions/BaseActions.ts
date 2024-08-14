import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'

/**
 * Base action for actions
 */
export class BaseActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!BaseActions.driver) {
      BaseActions.driver = VSBrowser.instance.driver
    }
  }
  /**
   * Hover mouse to element
   * @param locator locator to hover over
   * @param timeout timeout to wait for element
   */
  static async hoverElement(
    locator: Locator,
    timeout: number = 3000,
  ): Promise<void> {
    BaseActions.initializeDriver()
    const elementToHover = await BaseActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )
    await BaseActions.driver
      .actions( { async: true, bridge: true })
      .move({ duration: 5000, origin: elementToHover, x: 0, y: 0 })
      .perform()
  }
}
