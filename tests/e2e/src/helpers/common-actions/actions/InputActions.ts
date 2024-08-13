import { Key, VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'
import { BaseActions } from '@e2eSrc/helpers/common-actions/actions/BaseActions'

/**
 * Input fields
 */
export class InputActions extends BaseActions{

  static keyMap: { [key: string]: string } = {
    enter: Key.ENTER,
    tab: Key.TAB,
    up: Key.UP,
    down: Key.DOWN,
    backSpace: Key.BACK_SPACE
  }

  /**
   * Press key into input field
   * @param element input element where to pass key
   * @param key keyboard key to press
   * @param timeout timeout to wait for element
   */
  static async pressKey(
    inputLocator: Locator,
    key: string,
    timeout: number = 3000,
  ): Promise<void> {
    InputActions.initializeDriver()
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

  /**
   * Types the specified text into a Monaco Editor
   * @param editorLocator Identifies the Monaco Editor element
   * @param text The text to be typed into the Monaco Editor
   * @param timeout timeout to wait for element
   */
  static async typeTextInMonacoEditor(
    editorLocator: Locator,
    text: string,
    timeout = 3000,
  ): Promise<void> {
    InputActions.initializeDriver()
    // Create an Actions instance
    const actions = InputActions.driver.actions({
      async: true,
      bridge: false,
    })
    const editorElement = await InputActions.driver.wait(
      until.elementLocated(editorLocator),
      timeout,
    )

    // Click the element to focus
    await actions.move({ origin: editorElement }).click().perform()
    // Send the keys
    if (text.startsWith('{') || text.startsWith('[') || text.startsWith('"')) {
      await actions
        .sendKeys(text.slice(0, 1))
        .sendKeys(Key.ARROW_RIGHT)
        .sendKeys(Key.BACK_SPACE)
        .sendKeys(text.slice(1))
        .perform()
    } else {
      await actions.sendKeys(text).perform()
    }
  }

  /**
   * Sets the specified file(s) to the file input element
   * @param locator Identifies the input field to which file paths are written
   * @param filePath The path to the uploaded file, or several such paths. Relative paths resolve from the folder with the test file
   */
  static async setFilesToUpload(
    locator: Locator,
    filePath: string | string[],
    timeout = 3000,
  ): Promise<void> {
    InputActions.initializeDriver()

    // Convert filePath to an array if it is not already
    const files = Array.isArray(filePath) ? filePath : [filePath]

    // Resolve relative paths if needed (assuming test files are in a known directory)
    const resolvedFiles = files.map(file =>
      require('path').resolve(__dirname, file),
    )

    // Wait for the file input element to be located
    const fileInputElement = await InputActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )

    // Set the file paths to the input element
    await fileInputElement.sendKeys(resolvedFiles.join('\n'))
  }
}
