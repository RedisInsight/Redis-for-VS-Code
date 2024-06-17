import { By } from 'selenium-webdriver'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { HashKeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add Hash Key details view
 */
export class AddHashKeyView extends AddKeyView {
  getFieldInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="hash-field-${index}"]`)

  getFieldValueInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="hash-value-${index}"]`)

  /**
   * Adding a new Hash key
   * @param keyParameters The hash key parameters
   * @param TTL The Time to live value of the key
   */
  async addHashKey(keyParameters: HashKeyParameters): Promise<void> {
    if (keyParameters.fields.length > 0) {
      await InputActions.typeText(
        this.getFieldInputByIndex(0),
        keyParameters.fields[0].field,
      )
      await InputActions.typeText(
        this.getFieldValueInputByIndex(0),
        keyParameters.fields[0].value,
      )
      if (keyParameters.fields.length > 1) {
        keyParameters.fields.shift()
        let i = 1
        for (const field of keyParameters.fields) {
          await ButtonActions.clickElement(this.addNewItemBtn)
          await InputActions.typeText(this.getFieldInputByIndex(i), field.field)
          await InputActions.typeText(
            this.getFieldValueInputByIndex(i),
            field.value,
          )
          i++
        }
      }
    }
  }
}
