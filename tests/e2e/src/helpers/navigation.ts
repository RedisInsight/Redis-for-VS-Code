import {
  ActivityBar,
  WebView,
  SideBarView,
  VSBrowser,
} from 'vscode-extension-tester'

export const openRedisView = async (): Promise<WebView> => {
  const browser = VSBrowser.instance
  await browser.waitForWorkbench(10000)

  const viewControl = await new ActivityBar().getViewControl(
    'Redis for VS Code',
  )
  if (!viewControl) {
    throw new Error('Redis for VS Code view not found in the Activity Bar')
  }

  const sidebarView: SideBarView = await viewControl.openView()
  const webview = new WebView(sidebarView)

  await new Promise(resolve => setTimeout(resolve, 1000))

  return webview
}
