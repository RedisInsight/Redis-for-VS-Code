import * as vscode from 'vscode'
import { WebviewPanel } from './Webview'
import { startBackend, closeBackend } from './server/bootstrapBackend'
import { WebViewProvider } from './WebViewProvider'

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  await startBackend(context)
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
        context,
        route: 'main/key',
        title: 'RedisInsight key details',
        viewId: 'ri-key',
        // todo: connection between webviews
        message: args,
      })
    }),
  )
}

export function deactivate() {
  closeBackend()
}
