import * as vscode from 'vscode'

export const NOTIFICATION_TIMEOUT = 5_000

export const getNonce = () => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const waitFor = async (timeout: number, condition: () => boolean): Promise<boolean> => {
  while (!condition() && timeout > 0) {
    // eslint-disable-next-line no-param-reassign
    timeout -= 100
    // eslint-disable-next-line no-await-in-loop
    await sleep(100)
  }

  return timeout > 0
}

export const showInformationMessage = (title: string) => {
  showMessage(vscode.ProgressLocation.Notification, title)
}

export const showErrorMessage = (title: string) => {
  showMessage(vscode.ProgressLocation.Notification, title)
}
const showMessage = (location: vscode.ProgressLocation, title: string) => {
  vscode.window.withProgress(
    {
      location,
      title,
      cancellable: false,
    },
    async (progress): Promise<void> => {
      await waitFor(NOTIFICATION_TIMEOUT, () => false)
      progress.report({ increment: 100 })
    },
  )
}

export const handleMessage = (message: any = {}) => {
  if (message.action === 'SelectKey') {
    vscode.commands.executeCommand('RedisInsight.openPage', message)
  }
  if (message.action === 'EditDatabase') {
    vscode.commands.executeCommand('RedisInsight.editDatabase', message)
  }
  if (message.action === 'ErrorMessage') {
    vscode.window.showErrorMessage(message.data)
  }
  if (message.action === 'InformationMessage') {
    // vscode.window.showInformationMessage(message.data)
    showInformationMessage(message.data)
  }
  if (message.action === 'OpenCli') {
    vscode.commands.executeCommand('RedisInsight.cliOpen', message)
  }
  if (message.action === 'AddCli') {
    vscode.commands.executeCommand('RedisInsight.addCli', message)
  }
  if (message.action === 'AddKey') {
    vscode.commands.executeCommand('RedisInsight.addKeyOpen', message)
  }
  if (message.action === 'CloseAddKey') {
    vscode.commands.executeCommand('RedisInsight.addKeyClose')
  }
  if (message.action === 'CloseAddRefreshKey') {
    vscode.commands.executeCommand('RedisInsight.addKeyCloseAndRefresh', message)
  }
  if (message.action === 'CloseKeyAndRefresh') {
    vscode.commands.executeCommand('RedisInsight.closeKeyAndRefresh', message.data)
  }
  if (message.action === 'CloseAddDatabase') {
    vscode.commands.executeCommand('RedisInsight.addDatabaseClose')
  }
  if (message.action === 'CloseEditDatabase') {
    vscode.commands.executeCommand('RedisInsight.editDatabaseClose', message)
  }
}
