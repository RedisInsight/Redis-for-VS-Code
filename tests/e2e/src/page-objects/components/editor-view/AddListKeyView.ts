import { By } from 'selenium-webdriver'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { AddKeyView } from '@e2eSrc/page-objects/components/editor-view/AddKeyView'
import { ListKeyParameters } from '@e2eSrc/helpers/types/types'
import { AddElementInList } from '@e2eSrc/helpers/constants';

/**
 * Add List Key details view
 */
export class AddListKeyView extends AddKeyView {
  destinationSelect = By.xpath(`//vscode-dropdown[@data-testid='destination-select']`)
  fromHeadSelection = By.xpath(`//*[@data-testid='HEAD']`)
  addAdditionalElement = By.xpath(`//*[@data-testid='add-new-item']`)

  getElementValueInput = (index: number): By =>
    By.xpath(
      `//*[@data-testid='element-${index}']`,
    )

  /**
   * Adding a new List key
   * @param keyParameters The list key parameters
   * @param TTL The Time to live value of the key
   */
  async addListKey(keyParameters: ListKeyParameters): Promise<void> {
    if (keyParameters.element.length > 0) {
      if(keyParameters.position !== undefined && keyParameters.position === AddElementInList.Head){
        await ButtonActions.clickAndWaitForElement(
          this.destinationSelect,
          this.fromHeadSelection,
        )
        await ButtonActions.clickAndWaitForElement(this.fromHeadSelection, this.fromHeadSelection, false)
      }
      for (let i = 0; i < keyParameters.element.length; i ++){
        await InputActions.typeText(this.getElementValueInput(i), keyParameters.element[i])

        if (keyParameters.element.length > 1 && i < keyParameters.element.length - 1) {
          await ButtonActions.clickElement(this.addAdditionalElement)
        }
      }
    }
  }
}
