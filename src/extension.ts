import * as vscode from 'vscode'
import { WebviewPanel } from './Webview'
import { startBackend, closeBackend } from './server/bootstrapBackend'
import { WebViewProvider } from './WebViewProvider'
import { handleMessage } from './utils'

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  await startBackend()
  const sidebarProvider = new WebViewProvider('tree', context)
  const panelProvider = new WebViewProvider('cli', context)

  // Create a status bar item with a text and an icon
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  )
  myStatusBarItem.text = 'RedisInsight' // Use the desired icon from the list
  myStatusBarItem.tooltip = 'Click me for more info'
  myStatusBarItem.command = 'RedisInsight.openPage' // Command to execute on click
  // Show the status bar item
  // myStatusBarItem.show()

  context.subscriptions.push(
    myStatusBarItem,
    vscode.window.registerWebviewViewProvider('ri-sidebar', sidebarProvider),
    vscode.window.registerWebviewViewProvider('ri-panel', panelProvider),

    vscode.commands.registerCommand('RedisInsight.cliOpen', () => {
      vscode.commands.executeCommand('ri-panel.focus')
    }),

    vscode.commands.registerCommand('RedisInsight.openPage', (args) => {
      WebviewPanel.getInstance({
        extensionUri: context.extensionUri,
        route: 'main/key',
        title: 'RedisInsight - Key details',
        viewId: 'ri-key',
        // todo: connection between webviews
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyOpen', (args) => {
      WebviewPanel.getInstance({
        extensionUri: context.extensionUri,
        route: 'main/add_key',
        title: 'RedisInsight - Add new key',
        viewId: 'ri-add-key',
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyClose', () => {
      WebviewPanel.getInstance({ viewId: 'ri-add-key' }).dispose()
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyCloseAndRefresh', () => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree' })
      WebviewPanel.getInstance({ viewId: 'ri-add-key' }).dispose()
    }),

    vscode.commands.registerCommand('RedisInsight.closeKeyAndRefresh', () => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree' })
      WebviewPanel.getInstance({ viewId: 'ri-key' })?.dispose()
    }),
  )
}

export function deactivate() {
  closeBackend()
}
