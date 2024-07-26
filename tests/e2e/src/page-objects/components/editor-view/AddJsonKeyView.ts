import { By } from 'selenium-webdriver'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add JSON Key details view
 */
export class AddJsonKeyView extends AddKeyView {
  jsonKeyValueInput = By.xpath(
    '//*[@class="view-lines monaco-mouse-cursor-text"]',
  )
  uploadInput = By.xpath('//input[@data-testid="upload-input-file"]')

  /**
   * Create json key
   * @param keyParameters The string key parameters
   */
  async addJsonKey(keyParameters: JsonKeyParameters): Promise<void> {
    await InputActions.typeTextInMonacoEditor(
      this.jsonKeyValueInput,
      keyParameters.data,
    )
  }
}
