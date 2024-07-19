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
}
