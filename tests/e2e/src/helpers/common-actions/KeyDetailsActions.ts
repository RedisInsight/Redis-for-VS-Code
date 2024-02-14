import { WebView, KeyTreeView } from '@e2eSrc/page-objects/components'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

/**
 * Key details actions
 */
export class KeyDetailsActions extends CommonDriverExtension{
  /**
   * Open key details of the key by name in iframe
   * @param keyName The name of the key
   */
  static async openKeyDetailsByKeyNameInIframe(name: string): Promise<void> {
    let webView = new WebView()
    let keyTreeView = new KeyTreeView()
    await webView.switchToFrame(Views.KeyTreeView)
    await this.driverSleep(1000)
    await keyTreeView.openKeyDetailsByKeyName(name)
    await webView.switchBack()
    await webView.switchToFrame(Views.KeyDetailsView)
  }
}
