import { VSBrowser, WebDriver } from 'vscode-extension-tester';
import { Locator, until } from 'selenium-webdriver';

/**
 * Buttons
 */
export class ButtonsActions {
  static driver: WebDriver;
  static initializeDriver(): void {
    if (!ButtonsActions.driver) {
      ButtonsActions.driver = VSBrowser.instance.driver;
    }
  }

  /**
   * Click on button with wait
   * @param locatorToClick  locator to click
   * @param locatorToDisplayed element to wait for
   * @param stateOfDisplayed state of wait (Visible or not Visible)
   * @param timeout timeout to wait for element
   */
  static async clickAndWaitForElement(locatorToClick: Locator, locatorToDisplayed: Locator, stateOfDisplayed: boolean = true, timeout: number = 3000): Promise<void> {
    ButtonsActions.initializeDriver();
    await ButtonsActions.clickElement(locatorToClick);
    // Wait for element
    const elementToWait  = await ButtonsActions.driver.wait(until.elementLocated(locatorToClick), timeout);
    stateOfDisplayed ? await ButtonsActions.driver.wait(until.elementIsVisible(elementToWait))
      : await ButtonsActions.driver.wait(until.elementIsNotVisible(elementToWait));
  }
  /**
   * Click on button with wait
   * @param locatorToClick locator to click
   * @param timeout timeout to wait for element
   */
  static async clickElement(locatorToClick: Locator, timeout: number = 3000): Promise<void> {
    ButtonsActions.initializeDriver();
    const elementToClick  = await ButtonsActions.driver.wait(until.elementLocated(locatorToClick), timeout);
    await elementToClick.click();
  }
}
