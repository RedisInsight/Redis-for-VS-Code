import * as vscode from 'vscode'
import { getNonce } from './utils/utils'
import { getUIStorage } from './lib'
import { handleMessage } from './utils/handleMessage'

export class WebViewProvider implements vscode.WebviewViewProvider {
  _doc?: vscode.TextDocument

  constructor(
    private readonly _route: string,
    private readonly _context: vscode.ExtensionContext,
    public view?: vscode.WebviewView,
  ) { }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    }
    // todo: connection between webviews
    webviewView.webview.onDidReceiveMessage(
      handleMessage,
      undefined,
      this._context.subscriptions,
    )

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
  }

  public revive(panel: vscode.WebviewView) {
    this.view = panel
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._context.extensionUri,
        'dist',
        'webviews',
        'style.css',
      ),
    )
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._context.extensionUri,
        'dist',
        'webviews',
        'index.mjs',
      ),
    )
    const viewRoute = this._route

    const uiStorage = getUIStorage()

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce()

    const contentSecurity = [
      `img-src ${webview.cspSource} 'self' data:`,
      `style-src ${webview.cspSource} 'self' 'unsafe-inline'`,
      `script-src 'self' 'nonce-${nonce}'`,
      'default-src * self blob:',
      'font-src self data:',
      'worker-src self blob: vscode-webview:',
    ]

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link href="${styleUri}" rel="stylesheet"/>
        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="${contentSecurity.join(';')}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script nonce="${nonce}">
          window.ri=${JSON.stringify(uiStorage)};
        </script>
      </head>
      <body>
        <div id="root" data-route="${viewRoute}"></div>
        <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
      </body>
      </html>`
  }
}
