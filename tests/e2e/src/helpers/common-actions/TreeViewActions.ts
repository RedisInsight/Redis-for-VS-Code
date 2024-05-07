import { expect } from 'chai'
import { TreeView } from '@e2eSrc/page-objects/components'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { ButtonActions } from './actions'

/**
 * Tree view actions
 */
export class TreeViewActions extends CommonDriverExtension {
  /**
   * Verify that not patterned keys not visible with delimiter
   * @param delimiter string with delimiter value
   */
  static async verifyNotPatternedKeys(delimiter: string): Promise<void> {
    let treeView = new TreeView()
    const notPatternedKeys = await treeView.getElements(
      treeView.getLimitedTreeViewKeys(40),
    )
    const notPatternedKeysNumber = notPatternedKeys.length

    for (let i = 0; i < notPatternedKeysNumber; i++) {
      expect(await notPatternedKeys[i].getText()).not.contain(
        delimiter,
        'Not patterned Keys contain delimiter',
      )
    }
  }

  /**
   * Get node name by folders
   * @param startFolder start folder
   * @param folderName name of folder
   * @param delimiter string with delimiter value
   */
  static getNodeName(
    startFolder: string,
    folderName: string,
    delimiter: string,
  ): string {
    return startFolder + folderName + delimiter
  }

  /**
   * Check tree view structure
   * @param folders name of folders for tree view build
   * @param delimiter string with delimiter value
   */
  static async checkTreeViewFoldersStructure(
    folders: string[][],
    delimiter: string,
  ): Promise<void> {
    let treeView = new TreeView()
    // Wait for key refresh
    await TreeViewActions.driverSleep(1000)
    // Verify not patterned keys
    await this.verifyNotPatternedKeys(delimiter)

    const foldersNumber = folders.length

    for (let i = 0; i < foldersNumber; i++) {
      const innerFoldersNumber = folders[i].length
      let prevNodeSelector = ''

      for (let j = 0; j < innerFoldersNumber; j++) {
        const nodeName = this.getNodeName(
          prevNodeSelector,
          folders[i][j],
          delimiter,
        )
        const node = treeView.getFolderSelectorByName(nodeName)
        const nodeElement = await treeView.getElement(node)
        const fullTestIdSelector = await nodeElement.getAttribute('data-testid')
        if (!fullTestIdSelector?.includes('expanded')) {
          await ButtonActions.clickElement(node)
        }
        prevNodeSelector = nodeName
      }

      // Verify that the last folder level contains required keys
      const foundKeyName = `${folders[i].join(delimiter)}`
      const firstFolderName = this.getNodeName('', folders[i][0], delimiter)
      const firstFolder = treeView.getFolderSelectorByName(firstFolderName)
      expect(
        await treeView.isElementDisplayed(
          treeView.getNotPatternedKeyByName(foundKeyName),
        ),
      ).eql(true, 'Specific key not found')
      await ButtonActions.clickElement(firstFolder)
    }
  }

  /**
   * Verify that keys can be scanned more and results increased
   */
  static async verifyScannningMore(): Promise<void> {
    let treeView = new TreeView()
    for (let i = 2; i <= 20; i += 2) {
      // Remember results value
      const rememberedScanResults = Number(
        (await treeView.getElementText(treeView.scanMoreBtn)).replace(
          /\s/g,
          '',
        ),
      )
      await treeView.waitForElementVisibility(
        treeView.loadingIndicator,
        10000,
        false,
      )
      const scannedValueText = await treeView.getElementText(
        treeView.keyScannedNumber,
      )
      const regExp = new RegExp(`${i} ` + '...')
      expect(scannedValueText).match(
        regExp,
        `The database is not automatically scanned by ${i} 000 keys`,
      )
      await ButtonActions.clickElement(treeView.scanMoreBtn)
      const scannedResults = Number(
        (await treeView.getElementText(treeView.scanMoreBtn)).replace(
          /\s/g,
          '',
        ),
      )
      expect(scannedResults).gt(rememberedScanResults)
    }
  }
}
