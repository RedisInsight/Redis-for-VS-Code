import * as fs from 'fs'
import { expect } from 'chai'
import { ActivityBar, Locator, VSBrowser, until } from 'vscode-extension-tester'
import { CommonDriverExtension } from '../CommonDriverExtension'
import { TreeView } from '@e2eSrc/page-objects/components'
import { InnerViews, WebView } from '@e2eSrc/page-objects/components/WebView'
import { AddNewDatabaseParameters } from '../types/types'
import { DatabaseAPIRequests } from '../api'
import { NotificationActions } from './actions'
import { KeyDetailsActions } from './KeyDetailsActions'

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
      await this.initializeDriver()
      expect(await this.driver.wait(until.elementLocated(item), 5000)).eql(
        true,
        `${item} icon not found`,
      )
    }
  }
  /**
   * Verify that success notification displayed when adding database
   */
  static async verifyDatabaseAdded(): Promise<void> {
    await this.driverSleep(1000)
    // Check the notification message
    await NotificationActions.checkNotificationMessage(
      `Database has been added`,
    )
    // Verify that panel is closed
    await KeyDetailsActions.verifyDetailsPanelClosed()
  }

  /**
   * Verify that success notification displayed when editing database
   */
  static async verifyDatabaseEdited(): Promise<void> {
    await this.driverSleep(1000)
    // Check the notification message
    await NotificationActions.checkNotificationMessage(
      `Database has been edited`,
    )
    // Verify that panel is closed
    await KeyDetailsActions.verifyDetailsPanelClosed()
  }

  /**
   * Accept License terms and add database using api
   * @param databaseParameters The database parameters
   */
  static async acceptLicenseTermsAndAddDatabaseApi(
    databaseParameters: AddNewDatabaseParameters,
  ): Promise<void> {
    await DatabaseAPIRequests.addNewStandaloneDatabaseApi(databaseParameters)
    await VSBrowser.instance.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await new WebView().switchToInnerViewFrame(InnerViews.KeyListInnerView)
    await new TreeView().clickDatabaseByName(databaseParameters.databaseName!)
  }

  /**
   * Find files by they name starts from directory
   * @param dir The path directory of file
   * @param fileStarts The file name should start from
   */
  static async findFilesByFileStarts(
    dir: string,
    fileStarts: string,
  ): Promise<string[]> {
    const matchedFiles: string[] = []
    const files = fs.readdirSync(dir)

    if (fs.existsSync(dir)) {
      for (const file of files) {
        if (file.startsWith(fileStarts)) {
          matchedFiles.push(file)
        }
      }
    }
    return matchedFiles
  }

  /**
   * Get files count by name starts from directory
   * @param dir The path directory of file
   * @param fileStarts The file name should start from
   */
  static async getFileCount(dir: string, fileStarts: string): Promise<number> {
    if (fs.existsSync(dir)) {
      const matchedFiles: string[] = []
      const files = fs.readdirSync(dir)
      for (const file of files) {
        if (file.startsWith(fileStarts)) {
          matchedFiles.push(file)
        }
      }
      return matchedFiles.length
    }
    return 0
  }
}
