import { By } from 'selenium-webdriver'
import { Key } from 'vscode-extension-tester'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import { InputActions } from '@e2eSrc/helpers/common-actions'

/**
 * CLI view on the bottom panel
 */
export class CliViewPanel extends WebView {
  cliPanel = By.xpath(`//*[@data-testid='panel-view-page']`)
  cliCommand = By.xpath('//span[@data-testid="cli-command"]')
  cliCommandWrapper = By.xpath('//span[@data-testid="cli-command-wrapper"]')
  cliOutput = By.xpath(`//span[contains(@class, 'cli-output-response')]`)
  cliOutputResponseSuccess = By.xpath(
    `//span[contains(@class, 'cli-output-response-success')]`,
  )
  cliCommandAutocomplete = By.xpath(
    '//span[@data-testid="cli-command-autocomplete"]',
  )
  workbenchBtn = By.xpath(`//*[@data-test-subj='cli-workbench-page-btn']`)
  addCliBtn = By.xpath(`//div[contains(@class, 'title-actions')]//a[contains(@aria-label, 'Add CLI')]`)
  cliInstance = By.xpath('//*[contains(@data-testid, "cli-select-row")]')
  cliInstanceDeleteBtn = By.xpath('//*[contains(@data-testid, "cli-delete-button")]')
  cliInstancesPanel = By.xpath('//*[@data-testid="history-panel-view"]')

  getCliInstanceByIndex = (index: number) =>
    By.xpath(`(//*[contains(@data-testid, "cli-select-row")])[${index}]`)

  /**
   * Get Cli responses count
   * @returns Promise resolving to number of Cli responses
   */
  async getCliResponsesCount(): Promise<number> {
    return (await super.getElements(this.cliOutputResponseSuccess))
      .length
  }

  /**
   * Type command in the CLI without sending it
   * @param command text of the command
   * @returns Promise resolving when the command is typed
   */
  async typeCommand(command: string): Promise<void> {
    await super.getElement(this.cliPanel)
    const input = await super.getElement(this.cliCommand)

    const currentValue = await input.getText()
    for (let i = 0; i < currentValue.length; i++) {
      await input.sendKeys(Key.BACK_SPACE)
      await InputActions.driver.sleep(100)
    }

    await input.sendKeys(Key.SPACE)
    await input.sendKeys(Key.BACK_SPACE)
    for (let i = 0; i < command.length; i++) {
      await input.sendKeys(command.charAt(i))
    }
  }

  /**
   * Execute command in the CLI
   * @param command text of the command
   * @returns Promise resolving when the command is finished
   */
  async executeCommand(command: string): Promise<void> {
    await super.getElement(this.cliPanel)
    const input = await super.getElement(this.cliCommand)

    const currentValue = await input.getText()
    for (let i = 0; i < currentValue.length; i++) {
      await input.sendKeys(Key.BACK_SPACE)
      await InputActions.driver.sleep(100)
    }

    await input.sendKeys(Key.SPACE)
    for (let i = 0; i < command.length; i++) {
      await input.sendKeys(command.charAt(i))
    }
    await input.sendKeys(Key.ENTER)
  }

  /**
   * Send commands in Cli
   * @param commands The commands to send
   */
  async sendCommandsInCli(commands: string[]): Promise<void> {
    for (const command of commands) {
      await this.executeCommand(command)
    }
  }

  /**
   * Get number of commands run in current CLI instance
   * @returns Promise resolving to number of commands in CLI
   */
  async getNumberOfCommands(): Promise<number> {
    return (await super.getElements(this.cliCommandWrapper)).length
  }

  /**
   * Get text from the last cli output, no formatting
   * @returns Promise resolving to cli result text
   */
  async getCliLastCommandResponse(): Promise<string> {
    await super.getElement(this.cliOutput)
    const commandsCount = await this.getNumberOfCommands()
    await super.getElement(this.cliOutput)
    const cliResponses = await super.getElements(this.cliOutput)

    return await cliResponses[commandsCount - 1].getText()
  }

  /**
   * Get all text from the entire cli, no formatting.
   * @returns Promise resolving to cli text
   */
  async getCliText(): Promise<string> {
    return await super.getElementText(this.cliPanel)
  }

  /**
   * Get cli command text
   * @returns Promise resolving to cli command text
   */
  async getCommandText(): Promise<string> {
    return await super.getElementText(this.cliCommand)
  }

  /**
   * Get cli command autocomplete text
   * @returns Promise resolving to cli command autocomplete text
   */
  async getAutocompleteText(): Promise<string> {
    return await super.getElementText(this.cliCommandAutocomplete)
  }

  /**
   * Get Cli instances count
   * @returns Promise resolving to number of Cli instances
   */
    async getCliInstancesCount(): Promise<number> {
      return (await super.getElements(this.cliInstance))
        .length
    }
}
