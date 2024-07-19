import { Locator, VSBrowser, WebDriver } from 'vscode-extension-tester'

export class CommonElementActions{

  static driver: WebDriver
  static initializeDriver(): void {
    if (!CommonElementActions.driver) {
      CommonElementActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * verify that view has all expected links
   * @param expectedLinks expected links
   * @param linksLocator locator of the links
   */
  static async  verifyConnectLinks(expectedLinks: string[], linksLocator: Locator): Promise<Boolean> {
    const links = await CommonElementActions.driver.findElements(linksLocator)

    const results = await Promise.all(links.map(async (link) => {
      const href = await link.getAttribute('href')
      return expectedLinks.includes(href)
    }))
    return results.every(result => result)
  }
}
