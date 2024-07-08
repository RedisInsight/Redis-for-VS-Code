import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'

/**
 * Database details view
 */
export class DatabaseDetailsView extends WebView {
  // Inputs
  hostInput = By.xpath(`//*[@data-testid='host']`)
  portInput = By.xpath(`//*[@data-testid='port']`)
  databaseAliasInput = By.xpath(`//*[@data-testid='name']`)
  passwordInput = By.xpath(`//*[@data-testid='password']`)
  usernameInput = By.xpath(`//*[@data-testid='username']`)
  timeoutInput = By.xpath(`//*[@data-testid='timeout']`)
  aliasInput = By.xpath(`//*[@data-testid='alias-input']`)
  sshHostInput = By.xpath(`//*[@data-testid='sshHost']`)
  sshPortInput = By.xpath(`//*[@data-testid='sshPort']`)
  sshUsernameInput = By.xpath(`//*[@data-testid='sshUsername']`)
  sshPasswordInput = By.xpath(`//*[@data-testid='sshPassword']`)
  sshPrivateKeyInput = By.xpath(`//*[@data-testid='sshPrivateKey']`)
  sshPassphraseInput = By.xpath(`//*[@data-testid='sshPassphrase']`)
  // Buttons
  saveDatabaseButton = By.xpath(`//*[@data-testid='btn-submit']`)
  // Dropdowns
  caCertField = By.xpath(`//*[@data-testid='select-ca-cert']`)
  clientCertField = By.xpath(`//*[@data-testid='select-cert']`)
  // Checkboxes
  useTlsCheckbox = By.xpath(`//input[@data-testid='tls']/../../div[contains(@class, 'checkmarkContainer')]`)
  useSSHCheckbox = By.xpath(`//input[@data-testid='use-ssh']/../../div[contains(@class, 'checkmarkContainer')]`)
  // Radiobuttons
  passwordRadioBtn = By.xpath(`//vscode-radio[@data-testid='radio-btn-password']`)
  sshPrivateKeyRadioBtn = By.xpath(`//vscode-radio[@data-testid='radio-btn-privateKey']`)
}
