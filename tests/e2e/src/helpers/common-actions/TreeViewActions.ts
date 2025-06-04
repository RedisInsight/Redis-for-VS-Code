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
  static async verifyNotPatternedKeysNotDisplayed(
    delimiter: string,
  ): Promise<void> {
    let treeView = new TreeView()
    if (
      await treeView.isElementDisplayed(treeView.getLimitedTreeViewKeys(40))
    ) {
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
    delimiter?: string,
  ): string {
    return delimiter
      ? `${startFolder}${delimiter}${folderName}`
      : `${startFolder}${folderName}`
  }

  /**
   * Check tree view structure
   * @param folders name of folders for tree view build
   * @param delimiter string with delimiter value
   */
  static async checkTreeViewFoldersStructure(
    folders: string[][],
    delimiters: string[],
  ): Promise<void> {
    let treeView = new TreeView()
    // Wait for key refresh
    await TreeViewActions.driverSleep(2000)
    // Verify not patterned keys
    await this.verifyNotPatternedKeysNotDisplayed(delimiters[0])

    for (let i = 0; i < folders.length; i++) {
      const delimiter = delimiters.length > 1 ? '-' : delimiters[0]
      let prevNodeName = ''
      let prevDelimiter = ''

      // Expand subfolders
      for (let j = 0; j < folders[i].length; j++) {
        const nodeName = this.getNodeName(
          prevNodeName,
          folders[i][j],
          prevDelimiter,
        )
        const node = treeView.getFolderSelectorByName(nodeName)
        const fullTestIdSelector = await treeView.getElementAttribute(
          node,
          'data-testid',
        )

        if (!fullTestIdSelector?.includes('expanded')) {
          await ButtonActions.clickElement(node)
        }

        prevNodeName = nodeName
        prevDelimiter = delimiter
      }

      // Verify that the last folder level contains required keys
      const foundKeyName = `${folders[i].join(delimiter)}`
      const firstFolderName = this.getNodeName('', folders[i][0])
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
    for (let i = 2; i <= 6; i += 2) {
      // Remember results value
      const rememberedScanResults = await treeView.getScannedResults()
      await treeView.waitForElementVisibility(
        treeView.loadingIndicator,
        2000,
        false,
      )
      const scannedValueText = await treeView.getElementText(
        treeView.scanMoreBtn,
      )
      const regExp = new RegExp('\\b\\d{1,3}(?: \\d{3})*\\b')
      expect(scannedValueText).match(
        regExp,
        `The database is not automatically scanned by ${i} 000 keys`,
      )
      await ButtonActions.clickAndWaitForElement(
        treeView.scanMoreBtn,
        treeView.loadingIndicator,
        true,
        2000,
      )
      await treeView.waitForElementVisibility(
        treeView.loadingIndicator,
        2000,
        false,
      )
      const scannedResults = await treeView.getScannedResults()
      expect(scannedResults).gt(rememberedScanResults)
    }
  }
}
