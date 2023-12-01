import { By, until } from 'selenium-webdriver'
import { Key } from 'vscode-extension-tester'
import { AbstractElement } from '../AbstractElement'

/**
 * CLI view on the bottom panel
 */
export class CliView extends AbstractElement {
  cliPanel = By.xpath(`//*[@data-testid='panel-view-page']`)
  cliCommand = By.xpath('//span[@data-testid="cli-command"]')
  workbenchBtn = By.xpath(`//*[@data-test-subj='cli-workbench-page-btn']`)
  cliOutput = By.xpath(`//span[contains(@class, 'cli-output-response')]`)

  /**
   * Execute command in the CLI and wait for results
   * @param command text of the command
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving when the command is finished
   */
  async executeCommand(command: string, timeout: number = 5000): Promise<void> {
    await this.getDriver().wait(until.elementLocated(this.cliPanel), timeout)

    await this.getDriver().wait(until.elementLocated(this.cliCommand), timeout)
    const input = await this.getDriver().findElement(this.cliCommand)

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
   * Get all text from the internal cli, no formatting.
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving to all cli result text
   */
  async getCliResponse(timeout: number = 5000): Promise<string> {
    await this.getDriver().wait(until.elementLocated(this.cliOutput), timeout)
    return await (await this.getDriver().findElement(this.cliOutput)).getText()
  }
}
