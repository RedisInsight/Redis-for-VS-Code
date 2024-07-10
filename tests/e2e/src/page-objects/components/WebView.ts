import { By } from 'selenium-webdriver'
import { BaseComponent } from './BaseComponent'

/**
 * Returns a class that has the ability to access a webview.
 */
export class WebView extends BaseComponent {
  private handle: string | undefined

  iframeBody = By.xpath('//*[@class="vscode-dark"]')
  webViewIframe = By.xpath(
    `//iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
  )
  webViewViewIframe = By.xpath(`//iframe`)

  constructor() {
    super(
      By.xpath(
        `//iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
      ),
    )
  }

  /**
   * Switch the underlying webdriver context to directly inner view iframe
   * @param switchInnerView webdriver inner view iframe
   * @returns Promise resolving when switched to Inner WebView iframe
   */
  async switchToInnerViewFrame(switchInnerView: InnerViews): Promise<void> {
    await super.waitForElementVisibility(this.webViewIframe)

    const mainIframes = await super.getElements(this.webViewIframe)
    const innerFrameLocator = By.xpath(InnerViewLocators[switchInnerView])
    const innerFrameElement = By.xpath(InnerViewElements[switchInnerView])

    if (mainIframes.length > 1) {
      for (const mainIframe of mainIframes) {
        await WebView.driver.switchTo().frame(mainIframe)
        await super.waitForElementVisibility(this.webViewViewIframe)

        if (await super.isElementDisplayed(innerFrameLocator)) {
          const innerView = await super.getElement(innerFrameLocator)
          await WebView.driver.switchTo().frame(innerView)
          await super.waitForElementVisibility(innerFrameElement)
          return
        } else {
          await this.switchBack()
        }
      }
    } else {
      const firstView = await super.getElement(this.webViewIframe)
      await WebView.driver.switchTo().frame(firstView)
      await super.waitForElementVisibility(innerFrameLocator)
      const innerView = await super.getElement(innerFrameLocator)
      await WebView.driver.switchTo().frame(innerView)
      await super.waitForElementVisibility(innerFrameElement)
    }
  }

  /**
   * Switch the underlying webdriver back to the original window
   */
  async switchBack(): Promise<void> {
    if (!this.handle) {
      this.handle = await WebView.driver.getWindowHandle()
    }
    return await WebView.driver.switchTo().window(this.handle)
  }
}

export enum InnerViews {
  AddDatabaseInnerView,
  AddKeyInnerView,
  CliInnerView,
  EditDatabaseInnerView,
  EulaInnerView,
  KeyDetailsInnerView,
  SettingsInnerView,
  TreeInnerView,
}

export const InnerViewLocators = {
  [InnerViews.AddDatabaseInnerView]: `//iframe[@title='Redis Insight - Add Database connection']`,
  [InnerViews.AddKeyInnerView]: `//iframe[@title='Redis Insight - Add new key']`,
  [InnerViews.CliInnerView]: `//iframe[@title='Redis CLI']`,
  [InnerViews.EditDatabaseInnerView]: `//iframe[@title='Redis Insight - Edit Database connection']`,
  [InnerViews.EulaInnerView]: `//iframe[@title='Redis Insight - EULA']`,
  [InnerViews.KeyDetailsInnerView]: `//iframe[contains(@title,':')]`,
  [InnerViews.SettingsInnerView]: `//iframe[@title='Redis Insight - Settings']`,
  [InnerViews.TreeInnerView]: `//iframe[@title='Redis Insight']`,
}

export const InnerViewElements = {
  [InnerViews.AddDatabaseInnerView]: `//input[@data-testid='host']`,
  [InnerViews.AddKeyInnerView]: `//input[@data-testid='key-input']`,
  [InnerViews.CliInnerView]: `//div[@data-testid='cli']`,
  [InnerViews.EditDatabaseInnerView]: `//input[@data-testid='port']`,
  [InnerViews.EulaInnerView]: `//*[@data-testid='check-option-eula']`,
  [InnerViews.KeyDetailsInnerView]: `//div[contains(@data-testid, '-value')]`,
  [InnerViews.SettingsInnerView]: `//input[@data-testid='input-delimiter']`,
  [InnerViews.TreeInnerView]: `//div[@data-testid='tree-view-page']`,
}
