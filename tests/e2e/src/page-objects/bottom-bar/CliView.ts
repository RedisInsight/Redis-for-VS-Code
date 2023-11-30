import { By, Key, WebElement, until } from 'selenium-webdriver'
import { Workbench } from 'vscode-extension-tester'
import { AbstractElement } from '../AbstractElement'

/**
 * CLI view on the bottom panel
 */
export class CliView extends AbstractElement {
  activeFrame = By.xpath('//iframe[@id="active-frame"]')
  // cliFrame = By.xpath(`//iframe[@id='active-frame' and not(@title='Graph')]`)
  cliFrame = By.xpath('//iframe[contains(@title, "RedisInsight CLI")]')
  cliPanel = By.xpath(`//*[@data-testid='panel-view-page']`)
  cliCommand = By.xpath('//span[@data-testid="cli-command"]/parent::span')
  iframeBody = By.xpath('//*[@class="vscode-dark"]')
  webViewFrame = By.xpath(
    `//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]`,
  )
  workbenchBtn = By.xpath(`//*[@data-test-subj='cli-workbench-page-btn']`)

  async getViewToSwitchTo(): Promise<WebElement | undefined> {
    return await this.findElement(this.webViewFrame)
  }

  /**
   * Switch the underlying webdriver context to the webview iframe.
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving when switched to WebView iframe
   */
  async switchToFrame(timeout: number = 5000): Promise<void> {
    const view = await this.getViewToSwitchTo()

    if (!view) {
      return
    }
    console.log('WebElement content:', await view.getAttribute('outerHTML'))
    await this.getDriver().switchTo().frame(view)
    console.log('Switched to 1st iframe')

    // await this.getDriver().wait(until.elementLocated(this.cliFrame), timeout)

    await this.getDriver().switchTo().frame(0)
    console.log('Switched to 2nd iframe')

    // const frame = await view.findElement(this.cliFrame)
    // console.log('WebElement content:', await frame.getAttribute('outerHTML'))

    await this.getDriver().wait(until.elementLocated(this.iframeBody), timeout)
    const frame = await this.getDriver().findElement(this.iframeBody)
    console.log('WebElement content:', await frame.getAttribute('outerHTML'))
    await this.getDriver().wait(until.elementLocated(this.cliPanel), timeout)
    console.log('Element inside iframe found')
  }

  /**
   * Execute command in the CLI and wait for results
   * @param command text of the command
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving when the command is finished
   */
  async executeCommand(command: string, timeout: number = 5000): Promise<void> {
    // await this.getDriver().sleep(timeout)

    await this.getDriver().wait(until.elementLocated(this.cliCommand), timeout)
    const input = await this.findElement(this.cliCommand)
    console.log('Input found')

    try {
      console.log('Try to clear input')
      await input.clear()
    } catch (err) {
      // try clearing, ignore if not available
    }
    await input.sendKeys(command, Key.ENTER)

    let timer = 0
    let style = await input.getCssValue('left')
    do {
      if (timeout > 0 && timer > timeout) {
        throw new Error(`Timeout of ${timeout}ms exceeded`)
      }
      await new Promise(res => setTimeout(res, 500))
      timer += 500
      style = await input.getCssValue('left')
    } while (style === '0px')
  }

  /**
   * Get all text from the internal cli, no formatting.
   * @returns Promise resolving to all cli text
   */
  async getText(): Promise<string> {
    const clipboard = (await import('clipboardy')).default
    let originalClipboard = ''
    try {
      originalClipboard = clipboard.readSync()
    } catch (error) {
      // do not fail if clipboard is empty
    }
    const workbench = new Workbench()
    await workbench.executeCommand('redisinsight CLI select all')
    await workbench.getDriver().sleep(500)
    const text = clipboard.readSync()
    if (originalClipboard.length > 0) {
      clipboard.writeSync(originalClipboard)
    }
    return text
  }
}
