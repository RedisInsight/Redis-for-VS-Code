import { Locator, until, VSBrowser, WebDriver } from 'vscode-extension-tester'

export class CommonElementActions{

  static driver: WebDriver
  static initializeDriver(): void {
    if (!CommonElementActions.driver) {
      CommonElementActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Verify that view has all expected links
   * @param expectedLinks expected links
   * @param linksLocator locator of the links
   * @param timeout timeout to wait for element
   */
  static async verifyConnectLinks(expectedLinks: string[], linksLocator: Locator, timeout: number = 3000): Promise<Boolean> {
    CommonElementActions.initializeDriver()
    await CommonElementActions.driver.wait(
      until.elementsLocated(linksLocator),
      timeout,
    )
    const links = await CommonElementActions.driver.findElements(linksLocator)

    const results = await Promise.all(links.map(async (link) => {
      const href = await link.getAttribute('href')
      return expectedLinks.includes(href)
    }))
    return results.every(result => result)
  }
}
