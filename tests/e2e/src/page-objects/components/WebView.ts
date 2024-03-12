import { By, WebElement, until, Locator } from 'selenium-webdriver'
import { VSBrowser, WebDriver } from 'vscode-extension-tester'

/**
 * Returns a class that has the ability to access a webview.
 */
export class WebView {
  protected driver: WebDriver
  private handle: string | undefined

  iframeBody = By.xpath('//*[@class="vscode-dark"]')

  constructor() {
    this.driver = VSBrowser.instance.driver
  }

  /**
   * Search for an element inside the webview iframe.
   * Requires webdriver being switched to the webview iframe first.
   * (Will attempt to search from the main DOM root otherwise)
   * @param locator webdriver locator to search by
   * @returns promise resolving to WebElement when found
   */
  async findWebElement(locator: Locator): Promise<WebElement> {
    return await this.driver.findElement(locator)
  }

  /**
   * Search for all element inside the webview iframe by a given locator
   * Requires webdriver being switched to the webview iframe first.
   * (Will attempt to search from the main DOM root otherwise)
   * @param locator webdriver locator to search by
   * @returns promise resolving to a list of WebElement objects
   */
  async findWebElements(locator: Locator): Promise<WebElement[]> {
    return await this.driver.findElements(locator)
  }

  /**
   * Wait for the element to be found by locator and return it
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns WebElement
   */
  async getWebElement(
    locator: Locator,
    timeout: number = 5000,
  ): Promise<WebElement> {
    return await this.driver.wait(until.elementLocated(locator), timeout)
  }

  /**
   * Wait for the element inside the webview iframe to be visible/not visible and return it
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @param stateOfDisplayed state of wait (Visible or not Visible)
   * @returns WebElement
   */
  async waitForWebElementVisibility(
    locator: Locator,
    timeout: number = 5000,
    stateOfDisplayed: boolean = true,
  ): Promise<WebElement> {
    const webElement = await this.getWebElement(locator)
    const condition = stateOfDisplayed
      ? until.elementIsVisible(webElement)
      : until.elementIsNotVisible(webElement)
    return await this.driver.wait(condition, timeout)
  }

  /**
   * Switch the underlying webdriver context to the webview iframe.
   * @param switchView webdriver iframe view
   * @param switchInnerView webdriver iframe inner view
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving when switched to WebView iframe
   */
  async switchToFrame(
    switchView: Views,
    switchInnerView?: InnerViews,
  ): Promise<void> {
    const frameLocator = By.xpath(ViewLocators[switchView])
    const firstView = await this.waitForWebElementVisibility(frameLocator)
    await this.driver.switchTo().frame(firstView)

    if (switchInnerView) {
      const innerFrameLocator = By.xpath(InnerViewLocators[switchInnerView])
      await this.waitForWebElementVisibility(innerFrameLocator)
      const innerView = await this.waitForWebElementVisibility(innerFrameLocator)
      await this.driver.switchTo().frame(innerView)
    } else {
      await this.driver.switchTo().frame(0)
    }

    const elementLocator = By.xpath(ViewElements[switchView])
    await this.waitForWebElementVisibility(elementLocator)
  }

  /**
   * Switch the underlying webdriver back to the original window
   */
  async switchBack(): Promise<void> {
    if (!this.handle) {
      this.handle = await this.driver.getWindowHandle()
    }
    return await this.driver.switchTo().window(this.handle)
  }
}

export enum Views {
  TreeView,
  KeyDetailsView,
  CliViewPanel,
  AddKeyView,
  DatabaseDetailsView,
}

export const ViewLocators = {
  [Views.TreeView]:
    "//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]",
  [Views.KeyDetailsView]:
    "//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe",
  [Views.CliViewPanel]:
    "//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]",
  [Views.AddKeyView]:
    "//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe",
  [Views.DatabaseDetailsView]:
    "//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe",
}

export const ViewElements = {
  [Views.TreeView]: `//div[@data-testid='tree-view-page']`,
  [Views.KeyDetailsView]: `//*[@data-testid='key-details-page']`,
  [Views.CliViewPanel]: `//*[@data-testid='panel-view-page']`,
  [Views.AddKeyView]: `//*[@data-testid='select-key-type']`,
  [Views.DatabaseDetailsView]: `//*[contains(@data-testid,  'database-') and contains(@data-testid,  '-page')]`,
}

export enum InnerViews {
  KeyListInnerView,
  KeyDetailsInnerView,
}

export const InnerViewLocators = {
  [InnerViews.KeyListInnerView]: "//iframe[@title='RedisInsight']",
  [InnerViews.KeyDetailsInnerView]:
    "//iframe[@title='RedisInsight - Key details']",
}
