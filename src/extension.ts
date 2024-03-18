import * as vscode from 'vscode'
import * as l10n from '@vscode/l10n'
import { WebviewPanel } from './Webview'
import { startBackend, closeBackend } from './server/bootstrapBackend'
import { WebViewProvider } from './WebViewProvider'
import { handleMessage } from './utils'
import { ViewId } from './constants'

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  if (process.env.RI_WITHOUT_BACKEND !== 'true') {
    await startBackend(context)
  }
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

    vscode.commands.registerCommand('RedisInsight.addCli', (args) => {
      vscode.commands.executeCommand('setContext', 'RedisInsight.showCliPanel', true)
      vscode.commands.executeCommand('ri-panel.focus')
      setTimeout(() => {
        panelProvider.view?.webview.postMessage({ action: 'AddCli', data: args.data })
      }, 0)
    }),

    vscode.commands.registerCommand('RedisInsight.openPage', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/key',
        title: l10n.t('RedisInsight - Key details'),
        viewId: ViewId.Key,
        // todo: connection between webviews
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyOpen', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/add_key',
        title: l10n.t('RedisInsight - Add new key'),
        viewId: ViewId.AddKey,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addDatabase', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/add_database',
        title: l10n.t('RedisInsight - Add Database connection'),
        viewId: ViewId.AddDatabase,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.openSettings', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'settings',
        title: l10n.t('RedisInsight - Settings'),
        viewId: ViewId.Settings,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.editDatabase', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/edit_database',
        title: l10n.t('RedisInsight - Edit Database connection'),
        viewId: ViewId.EditDatabase,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisInsight.addKeyClose', () => {
      WebviewPanel.getInstance({ viewId: ViewId.Key }).dispose()
    }),

    vscode.commands.registerCommand('RedisInsight.addDatabaseClose', (args) => {
      WebviewPanel.getInstance({ viewId: ViewId.AddDatabase }).dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
    }),

    vscode.commands.registerCommand('RedisInsight.editDatabaseClose', (args) => {
      WebviewPanel.getInstance({ viewId: ViewId.EditDatabase }).dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
    }),

    vscode.commands.registerCommand('RedisInsight.closeAddKeyAndRefresh', (args) => {
      WebviewPanel.getInstance({ viewId: ViewId.AddKey })?.dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
      vscode.commands.executeCommand('RedisInsight.openPage', { action: 'SelectKey', data: args })
    }),

    vscode.commands.registerCommand('RedisInsight.closeKeyAndRefresh', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
      WebviewPanel.getInstance({ viewId: ViewId.Key })?.dispose()
    }),

    vscode.commands.registerCommand('RedisInsight.editKeyName', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
    }),

    vscode.commands.registerCommand('RedisInsight.resetSelectedKey', () => {
      sidebarProvider.view?.webview.postMessage({ action: 'ResetSelectedKey' })
    }),

    vscode.commands.registerCommand('RedisInsight.updateSettings', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'UpdateSettings', data: args.data })
      panelProvider.view?.webview.postMessage({ action: 'UpdateSettings', data: args.data })
      // WebviewPanel.getInstance({ viewId: ViewId.Key }).update()
    }),

    vscode.commands.registerCommand('RedisInsight.updateSettingsDelimiter', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'UpdateSettingsDelimiter', data: args.data })
    }),
  )
}

export function deactivate() {
  closeBackend()
}
