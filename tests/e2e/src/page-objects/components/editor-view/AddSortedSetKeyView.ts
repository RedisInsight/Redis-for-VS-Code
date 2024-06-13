import { By } from 'selenium-webdriver'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { TreeView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { SortedSetKeyParameters } from '@e2eSrc/helpers/types/types'
import { CommonDriverExtension } from '@e2eSrc/helpers'

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
   * @param TTL The Time to live value of the key
   */
  async addSortedSetKey(
    keyParameters: SortedSetKeyParameters,
    TTL = '',
  ): Promise<void> {
    let treeView = new TreeView()

    await ButtonActions.clickElement(treeView.addKeyButton)

    await super.switchBack()
    await super.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await super.selectKeyTypeByValue(KeyTypesShort.ZSet)

    if (TTL.length > 0) {
      await InputActions.typeText(this.ttlInput, TTL)
    }

    if (keyParameters.members.length > 0) {
      await InputActions.typeText(
        this.getMemberNameInputByIndex(0),
        keyParameters.members[0].name,
      )
      await InputActions.typeText(
        this.getMemberScoreInputByIndex(0),
        (keyParameters.members[0].score).toString(),
      )
      if (keyParameters.members.length > 1) {
        keyParameters.members.shift()
        let i = 1
        for (const member of keyParameters.members) {
          await ButtonActions.clickElement(this.addNewItemBtn)
          await InputActions.typeText(this.getMemberNameInputByIndex(i), member.name)
          await InputActions.typeText(
            this.getMemberScoreInputByIndex(i),
            (member.score).toString(),
          )
          i++
        }
      }
    }

    await InputActions.typeText(this.keyNameInput, keyParameters.keyName)

    await ButtonActions.clickElement(this.saveMembersButton)
    await super.switchBack()
    await CommonDriverExtension.driverSleep(1000)
  }
}
