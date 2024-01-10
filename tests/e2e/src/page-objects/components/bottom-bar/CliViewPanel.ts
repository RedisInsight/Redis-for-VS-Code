import { By, until } from 'selenium-webdriver'
import { Key } from 'vscode-extension-tester'
import { BaseComponent } from '../BaseComponent'
import { ViewLocators, Views } from '@e2eSrc/page-objects/components/WebView'

/**
 * CLI view on the bottom panel
 */
export class CliViewPanel extends BaseComponent {
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
  static cliFrame = By.xpath(
    `//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
  )

  cliInstanceByIndex = (index: number) =>
    By.xpath(`(//*[contains(@data-testid, "cli-select-row")])[${index}]`)

  constructor() {
    super(By.xpath(ViewLocators[Views.CliViewPanel]))
  }

  /**
   * Get Cli responses count
   * @returns Promise resolving to number of Cli responses
   */
  async getCliResponsesCount(): Promise<number> {
    return (await this.getDriver().findElements(this.cliOutputResponseSuccess))
      .length
  }

  /**
   * Type command in the CLI without sending it
   * @param command text of the command
   * @returns Promise resolving when the command is typed
   */
  async typeCommand(command: string): Promise<void> {
    await this.getElement(this.cliPanel)
    const input = await this.getElement(this.cliCommand)

    try {
      await input.clear()
    } catch (err) {
      // try clearing, ignore if not available
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
    await this.getElement(this.cliPanel)
    const input = await this.getElement(this.cliCommand)

    try {
      await input.clear()
    } catch (err) {
      // try clearing, ignore if not available
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
    return (await this.getDriver().findElements(this.cliCommandWrapper)).length
  }

  /**
   * Get text from the last cli output, no formatting.
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving to cli result text
   */
  async getCliLastCommandResponse(timeout: number = 5000): Promise<string> {
    await this.getElement(this.cliOutput)
    const commandsCount = await this.getNumberOfCommands()
    await this.getDriver().wait(until.elementLocated(this.cliOutput), timeout)
    const cliResponses = await this.getDriver().findElements(this.cliOutput)

    return await cliResponses[commandsCount - 1].getText()
  }

  /**
   * Get all text from the entire cli, no formatting.
   * @returns Promise resolving to cli text
   */
  async getCliText(): Promise<string> {
    return await (await this.getElement(this.cliPanel)).getText()
  }

  /**
   * Get cli command text
   * @returns Promise resolving to cli command text
   */
  async getCommandText(): Promise<string> {
    return await (await this.getElement(this.cliCommand)).getText()
  }

  /**
   * Get cli command autocomplete text
   * @returns Promise resolving to cli command autocomplete text
   */
  async getAutocompleteText(): Promise<string> {
    return await (await this.getElement(this.cliCommandAutocomplete)).getText()
  }

  /**
   * Get Cli instances count
   * @returns Promise resolving to number of Cli instances
   */
    async getCliInstancesCount(): Promise<number> {
      return (await this.getDriver().findElements(this.cliInstance))
        .length
    }
}
