// import {
//   enableHotReload,
//   hotRequireExportedFn,
//   registerUpdateReconciler,
// } from '@hediet/node-reload'
// import { Disposable } from '@hediet/std/disposable'
import * as vscode from 'vscode'
import * as http from 'http'
import { WebviewPanel } from './Webview'
import { bootstrap } from './server/app'
import { WebViewProvider } from './WebViewProvider'

let myStatusBarItem: vscode.StatusBarItem
let server: http.Server | undefined
export function activate(context: vscode.ExtensionContext) {
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
  context.subscriptions.push(myStatusBarItem)

  const sidebarProvider = new WebViewProvider(context.extensionUri, 'tree')
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('ri-sidebar', sidebarProvider),
  )

  const panelProvider = new WebViewProvider(context.extensionUri, 'cli')
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('ri-panel', panelProvider),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('RedisInsight.cliOpen', () => {
      vscode.commands.executeCommand('ri-panel.focus')
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('RedisInsight.openPage', () => {
      WebviewPanel.getInstance({
        extensionUri: context.extensionUri,
        route: 'view1',
        title: 'RedisInsight',
        viewId: 'ri',
      })
    }),
  )

  if (!server) {
    try {
      // Start the Express server
      bootstrap()
      vscode.window.showInformationMessage(
        'Server started at http://localhost:3000',
      )
    } catch (err) {
      const error = err as Error
      console.error({ error })

      vscode.window.showErrorMessage(`Error starting server: ${error.message}`)
    }
  }

  // context.subscriptions.push(
  //   hotRequireExportedFn(module, Extension, Extension => new Extension())
}
