import { Key, VSBrowser, WebDriver, WebElement } from 'vscode-extension-tester'

/**
 * Input fields
 */
export class Input {
  protected driver: WebDriver
  constructor() {
    this.driver = VSBrowser.instance.driver
  }

  keyMap: { [key: string]: string } = {
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
  async pressKey(element: WebElement, key: string): Promise<void> {
    const keyToSend = this.keyMap[key.toLowerCase()] || key
    await element.sendKeys(keyToSend)
  }
}
