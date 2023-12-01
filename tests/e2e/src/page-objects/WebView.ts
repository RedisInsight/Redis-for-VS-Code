import { By, WebElement, until, Locator } from 'selenium-webdriver'
import { AbstractElement } from './AbstractElement'

/**
 * Returns a class that has the ability to access a webview.
 */
export class WebView extends AbstractElement {
  constructor() {
    super(By.id('workbench.parts.panel'))
  }
  iframeBody = By.xpath('//*[@class="vscode-dark"]')
  webViewFrame = By.xpath(
    `//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
  )

  /**
   * Cannot use static element, since this class is unnamed.
   */
  private handle: string | undefined

  async getViewToSwitchTo(): Promise<WebElement> {
    return await this.findElement(this.webViewFrame)
  }

  /**
   * Search for an element inside the webview iframe.
   * Requires webdriver being switched to the webview iframe first.
   * (Will attempt to search from the main DOM root otherwise)
   *
   * @param locator webdriver locator to search by
   * @returns promise resolving to WebElement when found
   */
  async findWebElement(locator: Locator): Promise<WebElement> {
    return await this.getDriver().findElement(locator)
  }

  /**
   * Search for all element inside the webview iframe by a given locator
   * Requires webdriver being switched to the webview iframe first.
   * (Will attempt to search from the main DOM root otherwise)
   *
   * @param locator webdriver locator to search by
   * @returns promise resolving to a list of WebElement objects
   */
  async findWebElements(locator: Locator): Promise<WebElement[]> {
    return await this.getDriver().findElements(locator)
  }

  /**
   * Switch the underlying webdriver context to the webview iframe.
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving when switched to WebView iframe
   */
  async switchToFrame(timeout: number = 5000): Promise<void> {
    const view = await this.getViewToSwitchTo()

    await this.getDriver().switchTo().frame(view)

    await this.getDriver().switchTo().frame(0)

    await this.getDriver().wait(until.elementLocated(this.iframeBody), timeout)
    const frame = await this.findWebElement(this.iframeBody)
    console.log('WebElement content:', await frame.getAttribute('outerHTML'))
    console.log('Switched to webView 2nd iframe')
  }

  /**
   * Switch the underlying webdriver back to the original window
   */
  async switchBack(): Promise<void> {
    if (!this.handle) {
      this.handle = await this.getDriver().getWindowHandle()
    }
    return await this.getDriver().switchTo().window(this.handle)
  }
}
