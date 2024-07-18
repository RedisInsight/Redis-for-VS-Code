import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'

/**
 * Empty database list view
 */
export class EmptyDatabaseView extends WebView {
  connectDatabaseButton = By.xpath(
    `//vscode-button[@data-testid='connect-database-btn']`)

  connectLinks = By.xpath(
    `//h2[text()='Links']/parent::*/a`,
  )

  //verify that view has all expected links
  async verifyConnectLinks(expectedLinks: string[]): Promise<Boolean> {
    const links = await this.getElements(this.connectLinks)

    const results = await Promise.all(links.map(async (link) => {
      const href = await link.getAttribute('href')
      return expectedLinks.includes(href)
    }))
    return results.every(result => result)
  }

}
