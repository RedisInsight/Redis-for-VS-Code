import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'

/**
 * Buttons
 */
export class ButtonActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!ButtonActions.driver) {
      ButtonActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Click on button with wait
   * @param locatorToClick  locator to click
   * @param locatorToDisplayed element to wait for
   * @param stateOfDisplayed state of wait (Visible or not Visible)
   * @param timeout timeout to wait for element
   */
  static async clickAndWaitForElement(
    locatorToClick: Locator,
    locatorToDisplayed: Locator,
    stateOfDisplayed: boolean = true,
    timeout: number = 3000,
  ): Promise<void> {
    ButtonActions.initializeDriver()

    if (stateOfDisplayed) {
      await ButtonActions.clickElement(locatorToClick)
      await ButtonActions.driver.wait(
        until.elementLocated(locatorToDisplayed),
        timeout,
      )
      await ButtonActions.driver.wait(
        until.elementIsVisible(
          await ButtonActions.driver.findElement(locatorToDisplayed),
        ),
        timeout,
      )
    } else {
      await ButtonActions.clickElement(locatorToClick)
      try {
        const elementToWait = await ButtonActions.driver.wait(
          until.elementLocated(locatorToDisplayed),
          timeout,
        )
        await ButtonActions.driver.wait(
          until.elementIsNotVisible(elementToWait),
        )
      } catch (error) {}
    }
  }

  /**
   * Click on button
   * @param locatorToClick locator to click
   * @param timeout timeout to wait for element
   */
  static async clickElement(
    locatorToClick: Locator,
    timeout: number = 3000,
  ): Promise<void> {
    ButtonActions.initializeDriver()
    const elementToClick = await ButtonActions.driver.wait(
      until.elementLocated(locatorToClick),
      timeout,
    )
    await elementToClick.click()
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
    ButtonActions.initializeDriver()
    const elementToHover = await ButtonActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )
    await ButtonActions.driver
      .actions( { async: true, bridge: true })
      .move({ duration: 5000, origin: elementToHover, x: 0, y: 0 })
      .perform()
  }
}
