import { By } from 'selenium-webdriver'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { StringKeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add String Key details view
 */
export class AddStringKeyView extends AddKeyView {
  stringValueInput = By.xpath('//*[@data-testid="string-value"]')

  /**
   * Create string key
   * @param keyParameters The string key parameters
   */
  async addStringKey(keyParameters: StringKeyParameters): Promise<void> {
    if (keyParameters.value.length > 0) {
      await InputActions.typeText(this.stringValueInput, keyParameters.value)
    }
  }
}
