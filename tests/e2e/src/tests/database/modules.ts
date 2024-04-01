import { Locator } from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { TreeView, EditDatabaseView } from '@e2eSrc/page-objects/components'
import { DatabasesActions } from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Common, CommonDriverExtension, Config } from '@e2eSrc/helpers'

describe('Database modules', () => {
  let treeView: TreeView
  let editDatabaseView: EditDatabaseView
  let moduleList: Locator[]
  const uniqueId = Common.generateString(10)
  let database = {
    ...Config.ossStandaloneRedisearch,
    databaseName: `test_standalone-redisearch-${uniqueId}`,
  }

  beforeEach(async () => {
    treeView = new TreeView()
    editDatabaseView = new EditDatabaseView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(database)
    await treeView.editDatabaseByName(database.databaseName)
    await CommonDriverExtension.driverSleep(2000)
    await treeView.switchBack()
    await editDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )
  })
  afterEach(async () => {
    await editDatabaseView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can see full module list in the Edit mode', async function () {
    moduleList = [
      editDatabaseView.moduleSearchIcon,
      editDatabaseView.moduleJSONIcon,
      editDatabaseView.moduleGraphIcon,
      editDatabaseView.moduleTimeseriesIcon,
      editDatabaseView.moduleBloomIcon,
      editDatabaseView.moduleGearsIcon,
      editDatabaseView.moduleAIIcon,
    ]
    // Verify modules in Edit mode
    await DatabasesActions.checkModulesOnPage(moduleList)
  })
})
