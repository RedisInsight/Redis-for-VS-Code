import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'
import { BaseActions } from '@e2eSrc/helpers/common-actions/actions/BaseActions'

/**
 * Buttons
 */
export class ButtonActions extends BaseActions{

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
}
