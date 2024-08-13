import * as fs from 'fs'
import {
  ActivityBar,
  EditorView,
  Locator,
  VSBrowser,
  until,
} from 'vscode-extension-tester'
import { CommonDriverExtension } from '../CommonDriverExtension'
import { TreeView } from '@e2eSrc/page-objects/components'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { AddNewDatabaseParameters } from '../types/types'
import { DatabaseAPIRequests } from '../api'
import { NotificationActions } from './actions'
import { KeyDetailsActions } from './KeyDetailsActions'
import { ServerActions } from './ServerActions'
import { Eula } from '../api/Eula'

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
      await super.initializeDriver()
      const element = await super.driver.wait(until.elementLocated(item), 5000)
      await this.driver.wait(until.elementIsVisible(element), 5000)
    }
  }
  /**
   * Verify that success notification displayed when adding database
   */
  static async verifyDatabaseAdded(): Promise<void> {
    await super.driverSleep(1000)
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
    await super.driverSleep(1000)
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
    let treeView = new TreeView()
    await ServerActions.waitForServerInitialized()
    await Eula.accept()
    await DatabaseAPIRequests.addNewStandaloneDatabaseApi(databaseParameters)
    await VSBrowser.instance.waitForWorkbench(20_000)
    await NotificationActions.closeAllNotifications()
    await (await new ActivityBar().getViewControl('Redis for VSCode'))?.openView()
    await super.driverSleep(200)
    await (await new ActivityBar().getViewControl('Redis for VSCode'))?.closeView()
    await super.driverSleep(200)
    await (await new ActivityBar().getViewControl('Redis for VSCode'))?.openView()
    await new EditorView().closeAllEditors()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    if (
      !(await treeView.isElementDisplayed(
        treeView.getRefreshDatabaseBtnByName(databaseParameters.databaseName!),
      ))
    ) {
      await treeView.clickDatabaseByName(databaseParameters.databaseName!)
      await super.driverSleep(200)
    }
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

  /**
   * Refresh databases view
   */
  static async refreshDatabasesView(): Promise<void> {
    await ServerActions.waitForServerInitialized()
    await Eula.accept()
    await VSBrowser.instance.waitForWorkbench(20_000)
    await NotificationActions.closeAllNotifications()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
    await (await new ActivityBar().getViewControl('Redis for VSCode'))?.openView()
    await super.driverSleep(500)
    await (await new ActivityBar().getViewControl('Redis for VSCode'))?.closeView()
    await super.driverSleep(500)
    await (await new ActivityBar().getViewControl('Redis for VSCode'))?.openView()
    await new EditorView().closeAllEditors()
  }
}
