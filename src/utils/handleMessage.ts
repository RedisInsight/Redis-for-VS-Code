import * as vscode from 'vscode'
import { getUIStorageField, setUIStorageField } from '../lib'
import { signInCloudOauth } from '../lib/auth/auth.handler'

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
      if (message.data?.ssoFlow) {
        await setUIStorageField('ssoFlow', message.data?.ssoFlow)
      }

      vscode.commands.executeCommand('RedisForVSCode.addDatabase')
      break
    case 'CloseAddDatabase':
      console.debug('RedisForVSCode.addDatabaseClose, ', message.data)
      vscode.commands.executeCommand('RedisForVSCode.addDatabaseClose', message.data)
      break
    case 'CloseEditDatabase':
      vscode.commands.executeCommand('RedisForVSCode.editDatabaseClose', message.data)
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
    case 'RefreshDatabases':
      vscode.commands.executeCommand('RedisForVSCode.refreshDatabases', message.data)
      break
    case 'SaveAppInfo':
      await setUIStorageField('appInfo', message.data)
      break

    case 'CloudOAuth':
      signInCloudOauth(message.data)
      break

    case 'OpenExternalUrl':
      await vscode.env.openExternal(vscode.Uri.parse(message.data))
      break

    case 'OpenOAuthSso': ''
      vscode.commands.executeCommand('RedisForVSCode.oAuthSso', message.data)
      break
    case 'CloseOAuthSso':
      vscode.commands.executeCommand('RedisForVSCode.closeOAuthSso', message.data)
      break

    default:
      break
  }
}
