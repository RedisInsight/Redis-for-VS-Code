import { VSBrowser, WebDriver } from 'vscode-extension-tester'

export class CommonDriverExtension {
  static driver: WebDriver

  static initializeDriver(): void {
    if (!CommonDriverExtension.driver) {
      CommonDriverExtension.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Sleep for timeout seconds
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   */
  static async driverSleep(timeout: number = 5000): Promise<void> {
    CommonDriverExtension.initializeDriver()
    await CommonDriverExtension.driver.sleep(timeout)
  }
}
