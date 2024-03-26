import { expect } from 'chai'
import { By } from 'vscode-extension-tester'
import {
  WebView,
  TreeView,
  DatabaseDetailsView,
} from '@e2eSrc/page-objects/components'
import {
  InnerViews,
  ViewElements,
  Views,
} from '@e2eSrc/page-objects/components/WebView'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

/**
 * Key details actions
 */
export class KeyDetailsActions extends CommonDriverExtension {
  /**
   * Open key details of the key by name in iframe
   * @param keyName The name of the key
   */
  static async openKeyDetailsByKeyNameInIframe(name: string): Promise<void> {
    let webView = new WebView()
    await this.driverSleep(1000)
    await new TreeView().openKeyDetailsByKeyName(name)
    await webView.switchBack()
    await webView.switchToFrame(
      Views.KeyDetailsView,
      InnerViews.KeyDetailsInnerView,
    )
    await this.driverSleep(1000)
  }

  /**
   * Verify that details panel is closed
   */
  static async verifyDetailsPanelClosed(): Promise<void> {
    expect(
      await new DatabaseDetailsView().isElementDisplayed(
        By.xpath(ViewElements[Views.KeyDetailsView]),
      ),
    ).eql(false, 'Details panel not closed')
  }

  /**
   * Get tab name
   */
  static async getDetailsPanelName(): Promise<string> {
    // take the second tab since the first tab is Welcome
    const tabName = By.xpath(
      `(//div[@class = 'tabs-and-actions-container tabs-border-bottom']//a[@class = 'label-name'])[2]`,
    )
    return await new DatabaseDetailsView().getElementText(tabName)
  }
}
