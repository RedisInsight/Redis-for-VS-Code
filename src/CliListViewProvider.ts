import * as vscode from 'vscode'

class ListItem {
  constructor(public label: string, public id: number) { }
}

export class CliListViewProvider implements vscode.TreeDataProvider<ListItem> {
  // eslint-disable-next-line max-len
  private _onDidChangeTreeData: vscode.EventEmitter<ListItem | undefined> = new vscode.EventEmitter<ListItem | undefined>()

  readonly onDidChangeTreeData: vscode.Event<ListItem | undefined> = this._onDidChangeTreeData.event

  private itemList: ListItem[] = [
    new ListItem('redis-12871.c309.us-east-2-1.ec2.cloud.redislabs.com:12871', 1),
    new ListItem('redis-12871.c309.us-east-2-1.ec2.cloud.redislabs.com:12871', 2),
  ]

  // refresh(): void {
  //   this._onDidChangeTreeData.fire(this.itemList[0])
  // }

  getTreeItem(element: ListItem): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None)
    treeItem.command = {
      command: 'RedisInsight.itemAction',
      title: 'Action',
      arguments: [element],
    }
    treeItem.iconPath = new vscode.ThemeIcon('console')
    return treeItem
  }

  getChildren(element?: ListItem): ListItem[] {
    return element ? [] : this.itemList
  }
}
