import { expect } from 'chai'
import { By } from 'vscode-extension-tester'
import {
  TreeView,
  DatabaseDetailsView,
} from '@e2eSrc/page-objects/components'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'

/**
 * Key details actions
 */
export class KeyDetailsActions extends CommonDriverExtension {
  /**
   * Open key details of the key by name in iframe
   * @param keyName The name of the key
   */
  static async openKeyDetailsByKeyNameInIframe(name: string): Promise<void> {
    let treeView = new TreeView()
    await this.driverSleep(500)
    await treeView.openKeyDetailsByKeyName(name)
    await treeView.switchBack()
    await this.driverSleep(500)
    await treeView.switchToInnerViewFrame(InnerViews.KeyDetailsInnerView)
  }

  /**
   * Verify that details panel is closed
   */
  static async verifyDetailsPanelClosed(): Promise<void> {
    expect(
      await new DatabaseDetailsView().isElementDisplayed(
        By.xpath(InnerViews.KeyDetailsInnerView.toString()),
      ),
    ).eql(false, 'Details panel not closed')
  }
}
