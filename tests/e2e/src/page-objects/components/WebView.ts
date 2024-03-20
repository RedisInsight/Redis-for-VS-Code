import { By, WebElement, until, Locator } from 'selenium-webdriver'
import { VSBrowser, WebDriver } from 'vscode-extension-tester'

/**
 * Returns a class that has the ability to access a webview.
 */
export class WebView {
  protected driver: WebDriver
  private handle: string | undefined

  iframeBody = By.xpath('//*[@class="vscode-dark"]')
  webViewIframe = By.xpath(
    `//iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
  )
  webViewViewIframe = By.xpath(`//iframe`)

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
   * Is the web element displayed
   * @param locator locator to check
   */
  async isWebElementDisplayed(locator: Locator): Promise<boolean> {
    try {
      const elements = await this.driver.findElements(locator)
      if (elements.length > 0) {
        return await elements[0].isDisplayed()
      } else {
        return false
      }
    } catch (error) {
      return false
    }
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
   * Wait for the element inside the webview iframe to be visible/not visible
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @param stateOfDisplayed state of wait (Visible or not Visible)
   */
  async waitForWebElementVisibility(
    locator: Locator,
    timeout: number = 5000,
    stateOfDisplayed: boolean = true,
  ): Promise<void> {
    let element: WebElement
    if (stateOfDisplayed) {
      try {
        element = await this.driver.wait(until.elementLocated(locator), timeout)
        await this.driver.wait(until.elementIsVisible(element), timeout)
      } catch (e) {
        // Do nothing
      }
    } else {
      try {
        element = await this.driver.wait(until.elementLocated(locator), timeout)
        const isVisible = await element.isDisplayed()
        if (isVisible) {
          await this.driver.wait(until.elementIsNotVisible(element), timeout)
        }
      } catch (e) {}
      // Do nothing
    }
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
    await this.waitForWebElementVisibility(frameLocator)
    const firstView = await this.getWebElement(frameLocator)
    await this.driver.switchTo().frame(firstView)

    if (switchInnerView) {
      const innerFrameLocator = By.xpath(InnerViewLocators[switchInnerView])
      await this.waitForWebElementVisibility(innerFrameLocator)
      const innerView = await this.getWebElement(innerFrameLocator)
      await this.driver.switchTo().frame(innerView)
    } else {
      await this.driver.switchTo().frame(0)
    }

    const elementLocator = By.xpath(ViewElements[switchView])
    await this.waitForWebElementVisibility(elementLocator)
  }

  /**
   * Switch the underlying webdriver context to directly inner view iframe
   * @param switchInnerView webdriver iframe inner view
   * @returns Promise resolving when switched to Inner WebView iframe
   */
  async switchToInnerViewFrame(switchInnerView: InnerViews): Promise<void> {
    await this.waitForWebElementVisibility(this.webViewIframe)

    const mainIframes = await this.findWebElements(this.webViewIframe)

    if (mainIframes.length > 1) {
      for (const mainIframe of mainIframes) {
        await this.driver.switchTo().frame(mainIframe)

        const innerFrameLocator = By.xpath(InnerViewLocators[switchInnerView])
        await this.waitForWebElementVisibility(this.webViewViewIframe)

        if (await this.isWebElementDisplayed(innerFrameLocator)) {
          await this.waitForWebElementVisibility(innerFrameLocator)
          const innerView = await this.getWebElement(innerFrameLocator)
          await this.driver.switchTo().frame(innerView)
          return
        } else {
          await this.switchBack()
        }
      }
    } else {
      const firstView = await this.getWebElement(this.webViewIframe)
      await this.driver.switchTo().frame(firstView)
      const innerFrameLocator = By.xpath(InnerViewLocators[switchInnerView])
      await this.waitForWebElementVisibility(innerFrameLocator)
      const innerView = await this.getWebElement(innerFrameLocator)
      await this.driver.switchTo().frame(innerView)
    }
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
  SettingsInnerView,
  CliInnerView,
  AddDatabaseInnerView,
  EditDatabaseInnerView,
  AddKeyInnerView,
}

export const InnerViewLocators = {
  [InnerViews.KeyListInnerView]: `//iframe[@title='RedisInsight']`,
  [InnerViews.KeyDetailsInnerView]: `//iframe[@title='RedisInsight - Key details']`,
  [InnerViews.SettingsInnerView]: `//iframe[@title='RedisInsight - Settings']`,
  [InnerViews.CliInnerView]: `//iframe[@title='RedisInsight CLI']`,
  [InnerViews.AddDatabaseInnerView]: `//iframe[@title='RedisInsight - Add Database connection']`,
  [InnerViews.EditDatabaseInnerView]: `//iframe[@title='RedisInsight - Edit Database connection']`,
  [InnerViews.AddKeyInnerView]: `//iframe[@title='RedisInsight - Add new key']`,
}
