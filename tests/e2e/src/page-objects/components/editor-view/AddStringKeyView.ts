import { By } from 'selenium-webdriver'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'

/**
 * Add String Key details view
 */
export class AddStringKeyView extends AddKeyView {
  stringValueInput = By.xpath('//*[@data-testid="string-value"]')

  /**
   * Create string key
   * @param value The value of the key
   */
  async addStringKey(value: string = ''): Promise<void> {
    if (value.length > 0) {
      await InputActions.typeText(this.stringValueInput, value)
    }
  }
}
