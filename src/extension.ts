import * as vscode from 'vscode'
import { WebviewPanel } from './Webview'
import { startBackend, closeBackend } from './server/bootstrapBackend'
import { WebViewProvider } from './WebViewProvider'
import { CliListViewProvider } from './CliListViewProvider'

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  await startBackend()
  const sidebarProvider = new WebViewProvider('tree', context)
  const panelProvider = new WebViewProvider('cli', context)
  const cliListViewProvider = new CliListViewProvider()

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
    vscode.window.registerTreeDataProvider('ri-sub-panel', cliListViewProvider),

    vscode.commands.registerCommand('RedisInsight.cliOpen', () => {
      vscode.commands.executeCommand('ri-panel.focus')
      vscode.commands.executeCommand('ri-sub-panel.focus')
    }),

    vscode.commands.registerCommand('RedisInsight.addCli', () => {
      vscode.commands.executeCommand('ri-sub-panel.toggleVisibility')
    }),

    vscode.commands.registerCommand('RedisInsight.deleteCli', () => {
      vscode.commands.executeCommand('ri-sub-panel.toggleVisibility')
    }),

    vscode.commands.registerCommand('RedisInsight.openPage', (args) => {
      WebviewPanel.getInstance({
        extensionUri: context.extensionUri,
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
