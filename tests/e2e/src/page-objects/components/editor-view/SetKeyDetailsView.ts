import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'

/**
 * Set Key details view
 */
export class SetKeyDetailsView extends KeyDetailsView {
  setFieldsList = By.xpath(`//*[contains(@data-testid, 'set-member-value-')]`)
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'set-member-value-')]//*[@class='truncate']`,
  )

  /**
   * Add member to the Set key
   * @param keyMember The value of the set member
   */
  async addMemberToSet(keyMember: string): Promise<void> {
    await ButtonActions.clickElement(this.addKeyValueItemsButton)
    await InputActions.typeText(this.setMemberInput, keyMember)
    await ButtonActions.clickElement(this.saveMemberButton)
  }
}
