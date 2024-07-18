import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'

/**
 * Welcome view
 */
export class WelcomeView extends WebView {
  connectLinks = By.xpath(
    `//a[@data-testid='connect-database-btn']/following-sibling::a`,
  )

  async verifyConnectLinks(expectedLinks: string[]): Promise<Boolean> {
    const links = await this.getElements(this.connectLinks)

    const results = await Promise.all(links.map(async (link) => {
      const href = await link.getAttribute('href')
      return expectedLinks.includes(href)
    }))
    return results.every(result => result)
  }
}
