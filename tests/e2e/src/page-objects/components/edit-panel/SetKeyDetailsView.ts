import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'
import { InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers'

/**
 * Sorted Set Key details view
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
    await (await this.getElement(this.addKeyValueItemsButton)).click()
    await InputActions.typeText(this.setMemberInput, keyMember)
    await (await this.getElement(this.saveMemberButton)).click()
  }
}
