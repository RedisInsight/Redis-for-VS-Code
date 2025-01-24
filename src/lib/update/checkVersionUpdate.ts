import * as vscode from 'vscode'
import { workspaceStateService } from '../workspace/workspaceState'
import { EXTENSION_ID, EXTERNAL_LINKS } from '../../constants'
import { logger } from '../../logger'

export const checkVersionUpdate = async () => {
  const previousVersion = workspaceStateService.get('extensionVersion')
  const currentVersion = vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON.version

  logger.logCore(`Current version: ${currentVersion}`)
  workspaceStateService.set('extensionVersion', currentVersion)

  const linkText = vscode.l10n.t('Release Notes')
  const message = vscode.l10n.t('Redis for VS Code extension updated to {0}.', currentVersion)

  if (previousVersion && previousVersion !== currentVersion) {
    const selection = await vscode.window.showInformationMessage(message, linkText)

    if (selection === linkText) {
      await vscode.env.openExternal(vscode.Uri.parse(EXTERNAL_LINKS.releaseNotes))
    }
  }
}
