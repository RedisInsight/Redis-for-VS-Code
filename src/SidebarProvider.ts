import * as vscode from 'vscode'
import { getNonce } from './utils'

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView

  _doc?: vscode.TextDocument

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webviews', 'style.css'),
    )
    const scriptUri = webview.asWebviewUri(
      // vscode.Uri.joinPath(this._extensionUri, 'dist', 'webviews', 'index.es.js')
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webviews', 'index.mjs'),
    )

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce()

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link href="${styleUri}" rel="stylesheet" />
        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
  webview.cspSource
}; script-src 'nonce-${nonce}'; default-src * self blob">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script nonce="${nonce}">
        </script>
      </head>
      <body>
        <div id="root" data-route="view2"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`
  }
}
