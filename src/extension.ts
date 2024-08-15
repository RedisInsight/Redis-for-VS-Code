import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { WebviewPanel } from './Webview'
import { startBackend, getBackendGracefulShutdown } from './server/bootstrapBackend'
import { startBackendE2E } from './server/bootstrapBackendE2E'
import { checkVersionUpdate, initWorkspaceState } from './lib'
import { WebViewProvider } from './WebViewProvider'
import { handleMessage, truncateText } from './utils'
import { MAX_TITLE_KEY_LENGTH, ViewId } from './constants'
import { logger } from './logger'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

let myStatusBarItem: vscode.StatusBarItem
export async function activate(context: vscode.ExtensionContext) {
  logger.log('Extension activated')
  await initWorkspaceState(context)
  checkVersionUpdate()

  try {
    if (process.env.RI_WITHOUT_BACKEND !== 'true') {
      if (process.env.RI_TEST !== 'true') {
        await startBackend(logger)
      } else {
        await startBackendE2E(logger)
      }
    }
  } catch (error) {
    logger.log(`startBackend error: ${error}`)
  }
  const sidebarProvider = new WebViewProvider('sidebar', context)
  const panelProvider = new WebViewProvider('cli', context)

  // Create a status bar item with a text and an icon
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  )
  myStatusBarItem.text = 'Redis for VS Code' // Use the desired icon from the list
  myStatusBarItem.tooltip = 'Click me for more info'
  // myStatusBarItem.command = 'RedisForVSCode.openPage' // Command to execute on click
  // Show the status bar item
  // myStatusBarItem.show()

  context.subscriptions.push(
    myStatusBarItem,
    vscode.window.registerWebviewViewProvider('ri-sidebar', sidebarProvider),
    vscode.window.registerWebviewViewProvider('ri-panel', panelProvider, { webviewOptions: { retainContextWhenHidden: true } }),

    vscode.commands.registerCommand('RedisForVSCode.addCli', (args) => {
      vscode.commands.executeCommand('setContext', 'RedisForVSCode.showCliPanel', true)
      vscode.commands.executeCommand('ri-panel.focus')
      setTimeout(() => {
        panelProvider.view?.webview.postMessage({ action: 'AddCli', data: args.data })
      }, 100)
    }),

    vscode.commands.registerCommand('RedisForVSCode.openKey', (args) => {
      const title = `${args?.data?.displayedKeyType?.toLowerCase()}:${truncateText(args?.data?.keyString, MAX_TITLE_KEY_LENGTH)}`

      WebviewPanel.getInstance({
        context,
        title,
        route: 'main/key',
        viewId: ViewId.Key,
        // todo: connection between webviews
        message: args,
      })?.update({ title })
    }),

    vscode.commands.registerCommand('RedisForVSCode.addKeyOpen', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/add_key',
        title: vscode.l10n.t('Redis for VS Code - Add new key'),
        viewId: ViewId.AddKey,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisForVSCode.addDatabase', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/add_database',
        title: vscode.l10n.t('Redis for VS Code - Add Database connection'),
        viewId: ViewId.AddDatabase,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisForVSCode.openSettings', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/settings',
        title: vscode.l10n.t('Redis for VS Code - Settings'),
        viewId: ViewId.Settings,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisForVSCode.openEula', (args) => {
      vscode.commands.executeCommand('setContext', 'ri.openEula', true)

      WebviewPanel.instances[ViewId.AddDatabase]?.dispose()
      WebviewPanel.instances[ViewId.Settings]?.dispose()

      WebviewPanel.getInstance({
        context,
        route: 'main/eula',
        title: vscode.l10n.t('Redis for VS Code - EULA'),
        viewId: ViewId.Eula,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisForVSCode.closeEula', (args) => {
      WebviewPanel.instances[ViewId.Eula]?.dispose()

      vscode.commands.executeCommand('setContext', 'ri.openEula', false)
      sidebarProvider.view?.webview.postMessage({ action: 'CloseEula', data: args })
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })

      WebviewPanel.getInstance({
        context,
        route: 'main/welcome',
        title: vscode.l10n.t('Redis for VS Code - Welcome'),
        viewId: ViewId.Welcome,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisForVSCode.editDatabase', (args) => {
      WebviewPanel.getInstance({
        context,
        route: 'main/edit_database',
        title: vscode.l10n.t('Redis for VS Code - Edit Database connection'),
        viewId: ViewId.EditDatabase,
        handleMessage: (message) => handleMessage(message),
        message: args,
      })
    }),

    vscode.commands.registerCommand('RedisForVSCode.addKeyClose', () => {
      WebviewPanel.getInstance({ viewId: ViewId.Key }).dispose()
    }),

    vscode.commands.registerCommand('RedisForVSCode.addDatabaseClose', (args) => {
      WebviewPanel.getInstance({ viewId: ViewId.AddDatabase }).dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
    }),

    vscode.commands.registerCommand('RedisForVSCode.editDatabaseClose', (args) => {
      WebviewPanel.getInstance({ viewId: ViewId.EditDatabase }).dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
    }),

    vscode.commands.registerCommand('RedisForVSCode.closeAddKeyAndRefresh', (args) => {
      WebviewPanel.getInstance({ viewId: ViewId.AddKey })?.dispose()
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
      vscode.commands.executeCommand('RedisForVSCode.openKey', { action: 'SelectKey', data: args })
    }),

    vscode.commands.registerCommand('RedisForVSCode.closeKeyAndRefresh', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
      WebviewPanel.getInstance({ viewId: ViewId.Key })?.dispose()
    }),

    vscode.commands.registerCommand('RedisForVSCode.closeKey', () => {
      WebviewPanel.getInstance({ viewId: ViewId.Key })?.dispose()
    }),

    vscode.commands.registerCommand('RedisForVSCode.editKeyName', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'RefreshTree', data: args })
    }),

    vscode.commands.registerCommand('RedisForVSCode.resetSelectedKey', () => {
      sidebarProvider.view?.webview.postMessage({ action: 'ResetSelectedKey' })
    }),

    vscode.commands.registerCommand('RedisForVSCode.updateSettings', (args) => {
      const message = { action: 'UpdateSettings', data: args.data }

      // send a new settings to all open panels
      Object.values(WebviewPanel.instances).forEach((instance) => {
        instance.update({ message })
      })

      sidebarProvider.view?.webview.postMessage(message)
      panelProvider.view?.webview.postMessage(message)
    }),

    vscode.commands.registerCommand('RedisForVSCode.updateSettingsDelimiter', (args) => {
      sidebarProvider.view?.webview.postMessage({ action: 'UpdateSettingsDelimiter', data: args.data })
    }),
  )
}

export function deactivate() {
  try {
    getBackendGracefulShutdown()
  } catch (error) {
    logger.log(`Deactivating error: ${error}`)
  }
}
