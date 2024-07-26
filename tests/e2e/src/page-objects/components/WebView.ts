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
  completedProgressBar = By.xpath(`//div[@class = 'content']//div[@class = 'monaco-progress-container done']`)

  constructor() {
    super(
      By.xpath(
        `//iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
      ),
    )
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

  /**
   * Switch the underlying webdriver context to directly inner view iframe
   * @param switchInnerView webdriver inner view iframe
   * @returns Promise resolving when switched to Inner WebView iframe
   */
  async switchToInnerViewFrame(switchInnerView: InnerViews): Promise<void> {
    const maxRetries = 8
    const retryDelay = 100

    const innerFrameLocator = By.xpath(InnerViewLocators[switchInnerView])
    const innerFrameElement = By.xpath(InnerViewElements[switchInnerView])

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Waiting for any parent iframe to be visible
        await super.waitForElementVisibility(this.webViewIframe)

        // Find all parent iframes
        const mainIframes = await super.getElements(this.webViewIframe)

        for (const mainIframe of mainIframes) {
          await WebView.driver.switchTo().frame(mainIframe)

          try {
            // Check that parent iframe has child iframe
            await super.waitForElementVisibility(this.webViewViewIframe)

            // Check if the child iframe is the right one
            if (await super.isElementDisplayed(innerFrameLocator)) {
              const innerView = await super.getElement(innerFrameLocator)
              await WebView.driver.switchTo().frame(innerView)
              await super.waitForElementVisibility(innerFrameElement)
              return
            } else {
              await this.switchBack()
            }
          } catch (err: any) {
            console.warn(
              `Attempt ${attempt} - Unable to switch to inner frame: ${err.message}`,
            )
            await this.switchBack()
          }
        }

        // If only one parent iframe exists
        if (mainIframes.length === 1) {
          const firstView = await super.getElement(this.webViewIframe)
          await WebView.driver.switchTo().frame(firstView)

          try {
            // Check that parent iframe has child iframe
            await super.waitForElementVisibility(this.webViewViewIframe)

            // Check if the child iframe is the right one
            await super.waitForElementVisibility(innerFrameLocator)
            const innerView = await super.getElement(innerFrameLocator)
            await WebView.driver.switchTo().frame(innerView)
            await super.waitForElementVisibility(innerFrameElement)
            return
          } catch (err: any) {
            console.warn(
              `Attempt ${attempt} - Unable to switch to inner frame: ${err.message}`,
            )
          }
        }
      } catch (err: any) {
        console.warn(`Attempt ${attempt} failed: ${err.message}`)
      }

      // Retry delay
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    throw new Error(
      'Unable to switch to inner view iframe after multiple attempts',
    )
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
  WelcomeInnerView,
  EmptyDatabaseInnerView
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
  [InnerViews.WelcomeInnerView]: `//iframe[@title='Redis Insight - Welcome']`,
  [InnerViews.EmptyDatabaseInnerView]: `//iframe[@title='Redis Insight']`,
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
  [InnerViews.WelcomeInnerView]: `//div[@data-testid='welcome-page']`,
  [InnerViews.EmptyDatabaseInnerView]: `//div[@data-testid='no-databases-page']`,
}
