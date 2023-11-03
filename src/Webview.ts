import * as vscode from 'vscode'
import { nanoid } from 'nanoid'

type WebviewOptions = {
  extensionUri: vscode.Uri
  route: string
  title: string
  viewId: string
  scriptUri?: vscode.Uri
  styleUri?: vscode.Uri
  nonce?: string
  handleMessage?: (message: any) => any
}

abstract class Webview {
  protected readonly _opts: Required<WebviewOptions>

  public constructor(options: WebviewOptions) {
    // fill out the internal configuration with defaults
    this._opts = {
      scriptUri: vscode.Uri.joinPath(
        options.extensionUri,
        // 'dist/webviews/index.es.js'
        'dist/webviews/index.mjs',
      ),
      styleUri: vscode.Uri.joinPath(
        options.extensionUri,
        'dist/webviews/style.css',
      ),
      nonce: nanoid(),
      handleMessage: () => {},
      ...options,
    }
  }

  protected getWebviewOptions(): vscode.WebviewOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,

      // And restrict the webview to only loading content from our extension's `dist` directory.
      localResourceRoots: [vscode.Uri.joinPath(this._opts.extensionUri, 'dist')],
    }
  }

  protected handleMessage(message: any): void {
    this._opts.handleMessage(message)
  }

  protected _getContent(webview: vscode.Webview) {
    // Prepare webview URIs
    const scriptUri = webview.asWebviewUri(this._opts.scriptUri)
    const styleUri = webview.asWebviewUri(this._opts.styleUri)

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
        <meta http-equiv="Content-Security-Policy" content="img-src ${
  webview.cspSource
} 'self' data:; style-src ${webview.cspSource}; script-src 'nonce-${this._opts.nonce}'; default-src * self blob">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">


        <link href="${styleUri}" rel="stylesheet" />
        <script nonce="${this._opts.nonce}">
          window.acquireVsCodeApi = acquireVsCodeApi;
        </script>

        <title>RedisInsight Webview</title>
      </head>
      <body>
        <div id="root" data-route="${this._opts.route}"></div>
        <script nonce="${this._opts.nonce}" src="${scriptUri}"></script>
      </body>
      </html>`
  }

  public abstract update(): void
}

export class WebviewPanel extends Webview implements vscode.Disposable {
  private static instances: { [id: string]: WebviewPanel } = {}

  private readonly panel: vscode.WebviewPanel

  private _disposables: vscode.Disposable[] = []

  // Singleton
  public static getInstance(
    opts: WebviewOptions & { column?: vscode.ViewColumn },
  ): WebviewPanel {
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
    } else {
      // Otherwise, create an instance
      instance = new WebviewPanel(options)
      WebviewPanel.instances[options.viewId] = instance
    }

    return instance
  }

  private constructor(
    opts: WebviewOptions & { column?: vscode.ViewColumn },
  ) {
    // Create the webview panel
    super(opts)
    this.panel = vscode.window.createWebviewPanel(
      opts.route,
      opts.title,
      opts.column || vscode.ViewColumn.One,
      this.getWebviewOptions(),
    )
    // Update the content
    this.update()

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this.panel.onDidDispose(() => this.dispose(), null, this._disposables)

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
  public update() {
    console.debug('Updating! ', this._opts.viewId)
    this.panel.title = this._opts.title
    this.panel.webview.html = this._getContent(this.panel.webview)
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

export class RedisInsightSidebar
  extends Webview
  implements vscode.WebviewViewProvider {
  private _webview?: vscode.WebviewView

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    // _context: vscode.WebviewViewResolveContext<unknown>,
    // _token: vscode.CancellationToken
  ): void | Thenable<void> {
    // Create the webviewView and configure it
    this._webview = webviewView
    this._webview.webview.options = this.getWebviewOptions()
    // Set the initial html
    this.update()
    // Handle messages from the webview
    this._webview.webview.onDidReceiveMessage(this.handleMessage, this)
  }

  // WebviewView updates are just "write the html to the view"
  update(): void {
    if (this._webview) {
      this._webview.webview.html = this._getContent(this._webview.webview)
    }
  }
}
