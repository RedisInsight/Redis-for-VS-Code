import * as vscode from 'vscode'
import { getUIStorageField, setUIStorageField } from './lib'
import { MAX_TITLE_KEY_LENGTH } from './constants'

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

export const handleMessage = async (message: any = {}) => {
  switch (message.action) {
    case 'SelectKey':
      vscode.commands.executeCommand('RedisForVSCode.openKey', message)
      break
    case 'EditDatabase':
      vscode.commands.executeCommand('RedisForVSCode.editDatabase', message)
      break
    case 'ErrorMessage':
      vscode.window.showErrorMessage(message.data)
      break
    case 'InformationMessage':
      vscode.window.showInformationMessage(message.data)
      break
    case 'AddCli':
      vscode.commands.executeCommand('RedisForVSCode.addCli', message)
      break
    case 'AddKey':
      vscode.commands.executeCommand('RedisForVSCode.addKeyOpen', message)
      break
    case 'CloseAddKey':
      vscode.commands.executeCommand('RedisForVSCode.addKeyClose')
      break
    case 'CloseAddKeyAndRefresh':
      vscode.commands.executeCommand('RedisForVSCode.closeAddKeyAndRefresh', message.data)
      break
    case 'CloseKeyAndRefresh':
      vscode.commands.executeCommand('RedisForVSCode.closeKeyAndRefresh', message.data)
      break
    case 'CloseKey':
      vscode.commands.executeCommand('RedisForVSCode.closeKey')
      break
    case 'EditKeyName':
      vscode.commands.executeCommand('RedisForVSCode.editKeyName', message.data)
      break
    case 'OpenAddDatabase':
      vscode.commands.executeCommand('RedisForVSCode.addDatabase')
      break
    case 'CloseAddDatabase':
      vscode.commands.executeCommand('RedisForVSCode.addDatabaseClose')
      break
    case 'CloseEditDatabase':
      vscode.commands.executeCommand('RedisForVSCode.editDatabaseClose', message)
      break
    case 'UpdateSettings':
      await setUIStorageField('appInfo', {
        ...getUIStorageField('appInfo'),
        config: message.data,
      })

      vscode.commands.executeCommand('RedisForVSCode.updateSettings', message)
      break
    case 'UpdateSettingsDelimiter':
      vscode.commands.executeCommand('RedisForVSCode.updateSettingsDelimiter', message)
      break
    case 'ShowEula':
      vscode.commands.executeCommand('RedisForVSCode.openEula', message)
      break
    case 'CloseEula':
      vscode.commands.executeCommand('RedisForVSCode.closeEula', message)
      break
    case 'SaveAppInfo':
      await setUIStorageField('appInfo', message.data)
      break
    default:
      break
  }
}

export const truncateText = (text = '', maxLength = 0, separator = '...') =>
  (text.length >= maxLength ? text.slice(0, maxLength) + separator : text)

export const getTitleForKey = (keyType: string, keyString: string): string =>
  `${keyType?.toLowerCase()}:${truncateText(keyString, MAX_TITLE_KEY_LENGTH)}`
