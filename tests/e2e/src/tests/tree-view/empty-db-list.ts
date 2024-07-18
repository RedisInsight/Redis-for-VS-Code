import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before,  after} from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import {
  TreeView,
  AddDatabaseView,
} from '@e2eSrc/page-objects/components'

import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Eula } from '@e2eSrc/helpers/api/Eula'
import { EmptyDatabaseView } from '@e2eSrc/page-objects/components/tree-view/EmptyDatabaseView'
import { ButtonActions } from '@e2eSrc/helpers/common-actions'
import { ServerActions } from '@e2eSrc/helpers/common-actions/ServerActions';

describe('Empty database', () => {
  let treeView: TreeView
  let emptyView: EmptyDatabaseView
  let addDatabaseView: AddDatabaseView

  before(async () => {
    treeView = new TreeView()
    emptyView = new EmptyDatabaseView()
    addDatabaseView = new AddDatabaseView()

    await ServerActions.waitForServerInitialized()
    await emptyView.waitForElementVisibility(emptyView.completedProgressBar)
    await DatabaseAPIRequests.deleteAllDatabasesApi()
    await Eula.accept()

    await emptyView.switchToInnerViewFrame(InnerViews.EmptyDatabaseView)

  })

  after(async () => {
    await addDatabaseView.switchBack()
  })

  it('Verify that form to add database can be opened from empty db page', async function () {
    const expectedWelcomeLinks = ['https://redis.io/docs/install/install-stack/docker/?utm_source=redisinsight&utm_medium=main&utm_campaign=docker']

    await ButtonActions.clickElement(emptyView.connectDatabaseView)

    expect(await emptyView.verifyConnectLinks(expectedWelcomeLinks)).eql(true,
      'Links are not expected on the Welcome page ')
    await treeView.switchBack()
    await addDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )
    expect(
      await addDatabaseView.isElementDisplayed(
        addDatabaseView.databaseAliasInput,
      ),
    ).eql(true, 'Add database page not opened')
  })
})
