import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'

/**
 * Buttons
 */
export class ButtonsActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!ButtonsActions.driver) {
      ButtonsActions.driver = VSBrowser.instance.driver
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
    ButtonsActions.initializeDriver()

    if (stateOfDisplayed) {
      await ButtonsActions.clickElement(locatorToClick)
      await ButtonsActions.driver.wait(
        until.elementLocated(locatorToDisplayed),
        timeout,
      )
    } else {
      const elementToWait = await ButtonsActions.driver.wait(
        until.elementLocated(locatorToDisplayed),
        timeout,
      )
      await ButtonsActions.clickElement(locatorToClick)

      try {
        await ButtonsActions.driver.wait(
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
    ButtonsActions.initializeDriver()
    const elementToClick = await ButtonsActions.driver.wait(
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
    ButtonsActions.initializeDriver()
    const elementToHover = await ButtonsActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )
    await ButtonsActions.driver
      .actions()
      .move({ duration: 5000, origin: elementToHover, x: 0, y: 0 })
      .perform()
  }
}
