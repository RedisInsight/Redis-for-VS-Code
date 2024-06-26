import { By } from 'selenium-webdriver'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { SetKeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add Set Key details view
 */
export class AddSetKeyView extends AddKeyView {
  getMemberInputByIndex = (index: number): By =>
    By.xpath(`//input[@id="member-${index}"]`)

  /**
   * Create set key
   * @param keyParameters The set key parameters
   * @param ttl The ttl of the key
   */
  async addSetKey(keyParameters: SetKeyParameters): Promise<void> {
    if (keyParameters.members.length > 0) {
      await InputActions.typeText(
        this.getMemberInputByIndex(0),
        keyParameters.members[0],
      )
      if (keyParameters.members.length > 1) {
        keyParameters.members.shift()
        let i = 1
        for (const value of keyParameters.members) {
          await ButtonActions.clickElement(this.addNewItemBtn)
          await InputActions.typeText(this.getMemberInputByIndex(i), value)
          i++
        }
      }
    }
  }
}
