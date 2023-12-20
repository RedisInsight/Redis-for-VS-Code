import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'

/**
 * String Key details view
 */
export class StringKeyDetailsView extends KeyDetailsView {
  keyStringValue = By.xpath(`//div[@data-testid='string-value']`)

  //String button locator
  loadAllStringValue = By.xpath(`//*[@data-testid='load-all-value-btn']`)
}
