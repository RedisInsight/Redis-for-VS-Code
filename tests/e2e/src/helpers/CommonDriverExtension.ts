import { VSBrowser, WebDriver } from 'vscode-extension-tester'

export class CommonDriverExtension {
  static driver: WebDriver

  constructor() {
    CommonDriverExtension.driver = VSBrowser.instance.driver
  }

  /**
   * Sleep for timeout seconds
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   */
  static async driverSleep(timeout: number = 5000): Promise<void> {
    await CommonDriverExtension.driver.sleep(timeout)
  }
}
