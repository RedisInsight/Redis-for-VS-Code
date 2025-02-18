import * as vscode from 'vscode'
import { getNonce } from './utils/utils'
import { getUIStorage } from './lib'
import { EXTENSION_NAME } from './constants'
import { handleMessage } from './utils/handleMessage'

type WebviewOptions = {
  context?: vscode.ExtensionContext
  route?: string
  title?: string
  viewId: string
  scriptUri?: vscode.Uri
  styleUri?: vscode.Uri
  nonce?: string
  message?: {
    action?: string
    data: object
  }
  column?: vscode.ViewColumn
  handleMessage?: (message: any) => any
}

abstract class Webview {
  protected readonly _opts: WebviewOptions

  public constructor(options: WebviewOptions) {
    // fill out the internal configuration with defaults
    this._opts = {
      scriptUri: vscode.Uri.joinPath(
        options.context?.extensionUri as vscode.Uri,
        'dist/webviews/index.mjs',
      ),
      styleUri: vscode.Uri.joinPath(
        options.context?.extensionUri as vscode.Uri,
        'dist/webviews/style.css',
      ),
      nonce: getNonce(),
      handleMessage,
      ...options,
    }
  }

  protected getWebviewOptions(): vscode.WebviewPanelOptions & vscode.WebviewOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,

      retainContextWhenHidden: true,

      // And restrict the webview to only loading content from our extension's `dist` directory.
      localResourceRoots: [vscode.Uri.joinPath(this._opts.context?.extensionUri as vscode.Uri, 'dist')],
    }
  }

  protected async handleMessage(message: any): Promise<void> {
    handleMessage(message)
  }

  protected _getContent(webview: vscode.Webview) {
    // Prepare webview URIs
    const scriptUri = webview.asWebviewUri(this._opts.scriptUri as vscode.Uri)
    const styleUri = webview.asWebviewUri(this._opts.styleUri as vscode.Uri)

    const uiStorage = getUIStorage()
    const database = (this._opts?.message?.data as any)?.database || (uiStorage as any)?.database
    const keyInfo = (this._opts?.message?.data as any)?.keyInfo || (uiStorage as any)?.keyInfo

    const uiStorageStringify = JSON.stringify({
      ...uiStorage,
      database,
      keyInfo,
    })

    const contentSecurity = [
      `img-src ${webview.cspSource} 'self' data:`,
      `style-src 'self' 'unsafe-inline' ${webview.cspSource}`,
      `script-src 'nonce-${this._opts.nonce}' 'self'
       https://file+.vscode-resource.vscode-cdn.net/ vscode-webview: 'unsafe-inline' 'unsafe-eval'`,
      'default-src * self blob:',
      'font-src self data:',
      'worker-src self vscode-webview: blob:',
    ]

    // Return the HTML with all the relevant content embedded
    // Also sets a Content-Security-Policy that permits all the sources
    // we specified. Note that img-src allows `self` and `data:`,
    // which is at least a little scary, but otherwise we can't stick
    // SVGs in CSS as background images via data URLs, which is hella useful.
    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="${contentSecurity.join(';')}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${styleUri}" rel="stylesheet" />
        <script nonce="${this._opts.nonce}">
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.ri=${uiStorageStringify};
        </script>

        <title>${EXTENSION_NAME} Webview</title>
      </head>
      <body>
        <div id="root" data-route="${this._opts.route}"></div>
        <script nonce="${this._opts.nonce}" src="${scriptUri}" type="module"></script>
      </body>
      </html>`
  }

  public abstract update(opts?: WebviewOptions): void
  public abstract setTitle(title: string): void
  public abstract postMessage(message: any): void
}

export class WebviewPanel extends Webview implements vscode.Disposable {
  public static instances: { [id: string]: WebviewPanel } = {}

  private readonly panel: vscode.WebviewPanel

  private _disposables: vscode.Disposable[] = []

  // Singleton
  public static getInstance(opts: WebviewOptions): WebviewPanel {
    const options = {
      column: vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined,
      ...opts,
    }

    let instance = WebviewPanel.instances[options.viewId]
    if (instance) {
      // If we already have an instance, use it to show the panel
      instance.panel.reveal(options.column)

      // todo: connection between webviews
      if (opts.message) {
        instance.panel.webview.postMessage(opts.message)
      }
      if (opts.title) {
        instance.panel.title = opts.title
      }
    } else {
      // Otherwise, create an instance
      instance = new WebviewPanel(options)
      WebviewPanel.instances[options.viewId] = instance
    }

    return instance
  }

  private constructor(opts: WebviewOptions) {
    // Create the webview panel
    super(opts)
    this.panel = vscode.window.createWebviewPanel(
      opts.route || '/',
      opts.title || '',
      opts.column || vscode.ViewColumn.One,
      this.getWebviewOptions(),
    )

    // Update the content
    this.update(opts)

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this.panel.onDidDispose(() => {
      vscode.commands.executeCommand('RedisForVSCode.resetSelectedKey')
      this.dispose()
    }, null, this._disposables)

    // Update the content based on view changes
    // this.panel.onDidChangeViewState(
    //   e => {
    //     console.debug('View state changed! ', this._opts.viewId,)
    //     if (this.panel.visible) {
    //       this.update()
    //     }
    //   },
    //   null,
    //   this._disposables
    // )

    this.panel.webview.onDidReceiveMessage(
      this.handleMessage,
      this,
      this._disposables,
    )
  }

  // Panel updates may also update the panel title
  // in addition to the webview content.
  public update({ title = '', message }: Partial<WebviewOptions> = { }) {
    console.debug('Updating! ', this._opts.viewId)
    this.panel.title = title || this._opts.title || ''
    this.panel.iconPath = vscode.Uri.joinPath(
      this._opts.context?.extensionUri as vscode.Uri,
      'dist/webviews/resources/redis_for_vscode.svg',
    )
    this.panel.webview.html = this._getContent(this.panel.webview)

    if (message) {
      this.panel.webview.postMessage(message)
    }
  }

  public setTitle(title: string) {
    this.panel.title = title
  }

  public postMessage(message: any) {
    this.panel.webview.postMessage(message)
  }

  public dispose() {
    // Disposes of this instance
    // Next time getInstance() is called, it will construct a new instance
    console.debug('Disposing! ', this._opts.viewId)
    delete WebviewPanel.instances[this._opts.viewId]

    // Clean up our resources
    this.panel.dispose()
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }
}

// export class RedisInsightPanelSerializer implements vscode.WebviewPanelSerializer {
//   deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown): Thenable<void> {
//     console.log('deserialized state: ', state)
//     webviewPanel
//   }
// }
