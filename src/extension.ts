import * as vscode from 'vscode'
import { WebviewPanel } from './Webview'
import { bootstrapBackend, closeBackend } from './server/backend'
import { WebViewProvider } from './WebViewProvider'

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  const startBE = process.env.RI_START_BE
  if (startBE) await bootstrapBackend()
  const sidebarProvider = new WebViewProvider(context.extensionUri, 'tree')
  const panelProvider = new WebViewProvider(context.extensionUri, 'cli')

  // Create a status bar item with a text and an icon
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  )
  myStatusBarItem.text = 'RedisInsight' // Use the desired icon from the list
  myStatusBarItem.tooltip = 'Click me for more info'
  myStatusBarItem.command = 'RedisInsight.openPage' // Command to execute on click
  // Show the status bar item
  myStatusBarItem.show()

  context.subscriptions.push(
    myStatusBarItem,
    vscode.window.registerWebviewViewProvider('ri-sidebar', sidebarProvider),
    vscode.window.registerWebviewViewProvider('ri-panel', panelProvider),

    vscode.commands.registerCommand('RedisInsight.cliOpen', () => {
      vscode.commands.executeCommand('ri-panel.focus')
    }),

    vscode.commands.registerCommand('RedisInsight.openPage', () => {
      WebviewPanel.getInstance({
        extensionUri: context.extensionUri,
        route: 'view1',
        title: 'RedisInsight',
        viewId: 'ri',
      })
    }),
  )
}

export function deactivate() {
  closeBackend()
}
