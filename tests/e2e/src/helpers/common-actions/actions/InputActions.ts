import { Key, VSBrowser, WebDriver, WebElement } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'

/**
 * Input fields
 */
export class InputActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!InputActions.driver) {
      InputActions.driver = VSBrowser.instance.driver
    }
  }

  static keyMap: { [key: string]: string } = {
    enter: Key.ENTER,
    tab: Key.TAB,
    up: Key.UP,
    down: Key.DOWN,
  }

  /**
   * Press key into input field
   * @param element input element where to pass key
   * @param key keyboard key to press
   */
  static async pressKey(element: WebElement, key: string): Promise<void> {
    const keyToSend = InputActions.keyMap[key.toLowerCase()] || key
    await element.sendKeys(keyToSend)
  }

  /**
   * Press key into input field
   * @param element input element where to pass key
   * @param text text to insert
   * @param delay to wait
   */
  static async slowType(
    element: WebElement,
    text: string,
    delay: number = 100,
  ) {
    InputActions.initializeDriver()
    for (const char of text) {
      await element.sendKeys(char)
      await InputActions.driver.sleep(delay)
    }
  }

  /**
   * get field value
   * @returns Promise resolving to string
   */
  static async getFieldValue(base: Locator): Promise<string> {
    InputActions.initializeDriver()
    const element = await InputActions.driver.wait(until.elementLocated(base))
    return await element.getText()
  }
}
