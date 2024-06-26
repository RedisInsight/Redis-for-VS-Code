import { By } from 'selenium-webdriver'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add Sorted Set Key details view
 */
export class AddSortedSetKeyView extends AddKeyView {
  getMemberNameInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="member-name-${index}"]`)

  getMemberScoreInputByIndex = (index: number): By =>
    By.xpath(`//input[@data-testid="member-score-${index}"]`)

  /**
   * Adding a new Sorted Set key
   * @param keyParameters The sorted set key parameters
   */
  async addSortedSetKey(keyParameters: SortedSetKeyParameters): Promise<void> {
    if (keyParameters.members.length > 0) {
      await InputActions.typeText(
        this.getMemberNameInputByIndex(0),
        keyParameters.members[0].name,
      )
      await InputActions.typeText(
        this.getMemberScoreInputByIndex(0),
        keyParameters.members[0].score.toString(),
      )
      if (keyParameters.members.length > 1) {
        keyParameters.members.shift()
        let i = 1
        for (const member of keyParameters.members) {
          await ButtonActions.clickElement(this.addNewItemBtn)
          await InputActions.typeText(
            this.getMemberNameInputByIndex(i),
            member.name,
          )
          await InputActions.typeText(
            this.getMemberScoreInputByIndex(i),
            member.score.toString(),
          )
          i++
        }
      }
    }
  }
}
