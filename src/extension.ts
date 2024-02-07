import * as vscode from 'vscode'
import { WebviewPanel } from './Webview'
import { startBackend, closeBackend } from './server/bootstrapBackend'
import { WebViewProvider } from './WebViewProvider'
import { handleMessage } from './utils'
import { ViewId } from './constants'

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  await startBackend(context)
  const sidebarProvider = new WebViewProvider('sidebar', context)
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
    vscode.window.registerWebviewViewProvider('ri-panel', panelProvider, { webviewOptions: { retainContextWhenHidden: true } }),

    vscode.commands.registerCommand('RedisInsight.cliOpen', (args) => {
      vscode.commands.executeCommand('ri-panel.focus')
    }),

    vscode.commands.registerCommand('RedisInsight.addCli', (args) => {
      vscode.commands.executeCommand('ri-panel.focus')
      setTimeout(() => {
        panelProvider.view?.webview.postMessage({ action: 'AddCli', data: args.data })
      }, 0)
    }),

    vscode.commands.registerCommand('RedisInsight.openPage', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/key',
        title: 'RedisInsight - Key details',
        viewId: ViewId.Key,
        // todo: connection between webviews
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyOpen', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/add_key',
        title: 'RedisInsight - Add new key',
        viewId: ViewId.AddKey,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addDatabase', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/add_database',
        title: 'RedisInsight - Add Database connection',
        viewId: ViewId.AddDatabase,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.editDatabase', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/edit_database',
        title: 'RedisInsight - Edit Database connection',
        viewId: ViewId.EditDatabase,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyClose', () => {
      WebviewPanel.getInstance({ viewId: ViewId.Key }).dispose()
    }),

    vscode.commands.registerCommand('RedisInsight.addDatabaseClose', () => {
      WebviewPanel.getInstance({ viewId: ViewId.AddDatabase }).dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree' })
    }),

    vscode.commands.registerCommand('RedisInsight.editDatabaseClose', () => {
      WebviewPanel.getInstance({ viewId: ViewId.EditDatabase }).dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree' })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyCloseAndRefresh', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree' })
      WebviewPanel.getInstance({ viewId: ViewId.AddKey }).dispose()
      vscode.commands.executeCommand('RedisInsight.openPage', { action: 'SelectKey', data: args.data })
    }),

    vscode.commands.registerCommand('RedisInsight.closeKeyAndRefresh', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
      WebviewPanel.getInstance({ viewId: ViewId.Key })?.dispose()
    }),
  )
}

export function deactivate() {
  closeBackend()
}
