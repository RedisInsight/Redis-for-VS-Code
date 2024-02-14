import { expect } from 'chai'
import { OSSClusterParameters } from '@e2eSrc/helpers/types/types'
import { AddDatabaseView } from '@e2eSrc/page-objects/components/edit-panel/AddDatabaseView'
import { Locator, Workbench } from 'vscode-extension-tester'
import { ButtonActions } from '.'
import { CommonDriverExtension } from '../CommonDriverExtension'

/**
 * Database details actions
 */
export class DatabasesActions extends CommonDriverExtension {
  /**
   * Check module icons on the page
   * @param moduleList Array with modules list
   */
  static async checkModulesOnPage(moduleList: Locator[]): Promise<void> {
    for (const item of moduleList) {
      expect(await this.driver.findElement(item)).eql(
        true,
        `${item} icon not found`,
      )
    }
  }
}
