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
   * @param timeout timeout to wait for element
   */
  static async pressKey(inputLocator: Locator, key: string, timeout: number = 3000,): Promise<void> {
    const inputElement = await InputActions.driver.wait(
      until.elementLocated(inputLocator),
      timeout,
    )
    const keyToSend = InputActions.keyMap[key.toLowerCase()] || key
    await inputElement.sendKeys(keyToSend)
  }

  /**
   * Press key into input field
   * @param element input element where to pass key
   * @param text text to insert
   * @param delay to wait
   * @param timeout timeout to wait for element
   */
  static async slowType(
    inputLocator: Locator,
    text: string,
    delay: number = 100,
    timeout: number = 3000,
  ) {
    InputActions.initializeDriver()
    const inputElement = await InputActions.driver.wait(
      until.elementLocated(inputLocator),
      timeout,
    )

    // Clear the input field by sending backspace key presses
    const currentValue = await inputElement.getAttribute('value')
    for (let i = 0; i < currentValue.length; i++) {
      await inputElement.sendKeys(Key.BACK_SPACE)
      await InputActions.driver.sleep(delay)
    }

    for (const char of text) {
      await inputElement.sendKeys(char)
      await InputActions.driver.sleep(delay)
    }
  }

  /**
   * Types the specified text into an input element
   * @param inputLocator Identifies the webpage element that will receive input focus
   * @param text The text to be typed into the specified webpage element
   * @param timeout timeout to wait for element
   */
  static async typeText(
    inputLocator: Locator,
    text: string,
    timeout: number = 3000,
  ): Promise<void> {
    InputActions.initializeDriver()
    const inputElement = await InputActions.driver.wait(
      until.elementLocated(inputLocator),
      timeout,
    )
    await inputElement.clear()
    await inputElement.sendKeys(text)
  }

  /**
   * Get attribute Value from input field
   * @param inputLocator Identifies the webpage element that will receive input focus
   * @param timeout timeout to wait for element
   */
  static async getInputValue(
    inputLocator: Locator,
    timeout: number = 3000,
  ): Promise<string> {
    InputActions.initializeDriver()
    const inputElement = await InputActions.driver.wait(
      until.elementLocated(inputLocator),
      timeout,
    )
    return await inputElement.getAttribute('value')
  }
}
