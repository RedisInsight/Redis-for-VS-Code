import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'

/**
 * Welcome view
 */
export class WelcomeView extends WebView {
  connectLinks = By.xpath(
    `//a[@data-testid='connect-database-btn']/following-sibling::a`,
  )
}
