import { By } from 'selenium-webdriver'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { ListKeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add List Key details view
 */
export class AddListKeyView extends AddKeyView {
  listElementInput = By.xpath('//*[@data-testid="element"]')

  /**
   * Adding a new List key
   * @param keyParameters The list key parameters
   * @param TTL The Time to live value of the key
   */
  async addListKey(keyParameters: ListKeyParameters): Promise<void> {
    if (keyParameters.element.length > 0) {
      await InputActions.typeText(this.listElementInput, keyParameters.element)
    }
  }
}
