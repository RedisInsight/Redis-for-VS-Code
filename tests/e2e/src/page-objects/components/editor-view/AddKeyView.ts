import { By } from 'selenium-webdriver'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InnerViews, WebView } from '../WebView'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { TreeView } from '../tree-view/TreeView'
import { CommonDriverExtension } from '@e2eSrc/helpers'
import {
  AddHashKeyView,
  AddJsonKeyView,
  AddListKeyView,
  AddSetKeyView,
  AddSortedSetKeyView,
  AddStringKeyView,
} from '..'
import { KeyParameters } from '@e2eSrc/helpers/types/types'

/**
 * Add Key details view
 */
export class AddKeyView extends WebView {
  keyTypeDropdown = By.xpath('//*[@data-testid="select-key-type"]')
  ttlInput = By.xpath('//*[@data-testid="ttl-input"]')
  keyNameInput = By.xpath('//*[@data-testid="key-input"]')
  addButton = By.xpath(
    `//*[@data-testid="btn-add"] 
    | //*[@data-testid="save-fields-btn"] 
    | //*[@data-testid="save-members-btn"]`,
  )
  addNewItemBtn = By.xpath(`//*[@data-testid='add-new-item']`)
  saveMembersButton = By.xpath('//*[@data-testid="save-members-btn"]')

  /**
   * Select key type
   * @param value The type of the key
   */
  async selectKeyTypeByValue(value: KeyTypesShort): Promise<void> {
    await ButtonActions.clickElement(this.keyTypeDropdown)

    // TODO should be fixed after adding more types
    const optionLocator = KeyTypesShort.ReJSON
      ? By.xpath(`//*[@value='ReJSON-RL']`)
      : By.xpath(`//*[@value='${value}']`)
    await ButtonActions.clickElement(optionLocator)
  }

  /**
   * Adding a new key
   * @param keyParameters The key parameters
   * @param keyType The key type
   * @param TTL The Time to live value of the key
   */
  async addKey(
    keyParameters: KeyParameters,
    keyType: KeyTypesShort,
    TTL = '',
  ): Promise<void> {
    const treeView = new TreeView()

    await ButtonActions.clickElement(treeView.addKeyButton)

    await this.switchBack()
    await this.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await this.selectKeyTypeByValue(keyType)

    if (TTL) {
      await InputActions.typeText(this.ttlInput, TTL)
    }

    await this.addKeyByType(keyType, keyParameters)

    await InputActions.typeText(this.keyNameInput, keyParameters.keyName)
    await ButtonActions.clickElement(this.addButton)
    await this.switchBack()
    await CommonDriverExtension.driverSleep(1000)
  }

  /**
   * Adding a new key by type
   * @param keyParameters The key parameters
   * @param keyType The key type
   * @param TTL The Time to live value of the key
   */
  private async addKeyByType(
    keyType: KeyTypesShort,
    keyParameters: any,
  ): Promise<void> {
    switch (keyType) {
      case KeyTypesShort.ZSet:
        await new AddSortedSetKeyView().addSortedSetKey(keyParameters)
        break
      case KeyTypesShort.Hash:
        await new AddHashKeyView().addHashKey(keyParameters)
        break
      case KeyTypesShort.List:
        await new AddListKeyView().addListKey(keyParameters)
        break
      case KeyTypesShort.Set:
        await new AddSetKeyView().addSetKey(keyParameters)
        break
      case KeyTypesShort.String:
        await new AddStringKeyView().addStringKey(keyParameters)
        break
      case KeyTypesShort.ReJSON:
        await new AddJsonKeyView().addJsonKey(keyParameters)
        break
      default:
        throw new Error(`Unsupported key type: ${keyType}`)
    }
  }
}
