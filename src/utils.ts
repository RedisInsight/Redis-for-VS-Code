import * as vscode from 'vscode'
import { workspaceStateService } from './lib'

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

export const handleMessage = async (message: any = {}) => {
  switch (message.action) {
    case 'SelectKey':
      vscode.commands.executeCommand('RedisInsight.openKey', message)
      break
    case 'EditDatabase':
      vscode.commands.executeCommand('RedisInsight.editDatabase', message)
      break
    case 'ErrorMessage':
      vscode.window.showErrorMessage(message.data)
      break
    case 'InformationMessage':
      vscode.window.showInformationMessage(message.data)
      break
    case 'AddCli':
      vscode.commands.executeCommand('RedisInsight.addCli', message)
      break
    case 'AddKey':
      vscode.commands.executeCommand('RedisInsight.addKeyOpen', message)
      break
    case 'CloseAddKey':
      vscode.commands.executeCommand('RedisInsight.addKeyClose')
      break
    case 'CloseAddKeyAndRefresh':
      vscode.commands.executeCommand('RedisInsight.closeAddKeyAndRefresh', message.data)
      break
    case 'CloseKeyAndRefresh':
      vscode.commands.executeCommand('RedisInsight.closeKeyAndRefresh', message.data)
      break
    case 'CloseKey':
      vscode.commands.executeCommand('RedisInsight.closeKey')
      break
    case 'EditKeyName':
      vscode.commands.executeCommand('RedisInsight.editKeyName', message.data)
      break
    case 'OpenAddDatabase':
      vscode.commands.executeCommand('RedisInsight.addDatabase')
      break
    case 'CloseAddDatabase':
      vscode.commands.executeCommand('RedisInsight.addDatabaseClose')
      break
    case 'CloseEditDatabase':
      vscode.commands.executeCommand('RedisInsight.editDatabaseClose', message)
      break
    case 'UpdateSettings':
      vscode.commands.executeCommand('RedisInsight.updateSettings', message)
      break
    case 'UpdateSettingsDelimiter':
      vscode.commands.executeCommand('RedisInsight.updateSettingsDelimiter', message)
      break
    case 'ShowEula':
      vscode.commands.executeCommand('RedisInsight.openEula', message)
      break
    case 'CloseEula':
      vscode.commands.executeCommand('RedisInsight.closeEula', message)
      break
    case 'SaveAppInfo':
      await workspaceStateService.set('appInfo', message.data)
      break
    default:
      break
  }
}

export const truncateText = (text = '', maxLength = 0, separator = '...') =>
  (text.length >= maxLength ? text.slice(0, maxLength) + separator : text)
