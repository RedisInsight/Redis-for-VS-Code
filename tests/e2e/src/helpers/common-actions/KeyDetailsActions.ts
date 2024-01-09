import { VSBrowser, WebDriver } from 'vscode-extension-tester'
import {
    WebView,
    KeyTreeView,
  } from '@e2eSrc/page-objects/components'
import { Views } from '@e2eSrc/page-objects/components/WebView'

/**
 * Key details actions
 */
export class KeyDetailsActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!KeyDetailsActions.driver) {
        KeyDetailsActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Open key details of the key by name in iframe
   * @param keyName The name of the key
   */
  static async openKeyDetailsByKeyNameInIframe(name: string): Promise<void> {
    let webView = new WebView()
    let keyTreeView = new KeyTreeView()
    await webView.switchToFrame(Views.KeyTreeView)
    await keyTreeView.openKeyDetailsByKeyName(name)
    await webView.switchBack()
    await webView.switchToFrame(Views.KeyDetailsView)
  }
}
