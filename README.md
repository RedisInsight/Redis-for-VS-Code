# RedisInsight-VS-Code-extension-Work-in-Progress

Temporary repository to work on the VS Code extension

### yarn is required
1. `npm i -g yarn`
2. `yarn install`
3. Press `F5` in the Visual studio code 
4. In the opened Visual studio code instance, click the RedisInsight icon in the sidebar

### Docs for all people:
[vsc toolkit storybook](https://microsoft.github.io/vscode-webview-ui-toolkit/)
[vsc toolkit figma](https://www.figma.com/file/PYCyGCOqN7gCFRnoPnbgqH/Visual-Studio-Code-Toolkit-(Community)?type=design&node-id=1-2&mode=design&t=IfTmvBc9Bh8KuMTy-0) 

### Docs for developers
#### Technologies:
[tailwind](https://tailwindcss.com/) 
[msw](https://mswjs.io/) (mock be responses)
[storybook ](https://storybook.js.org/)
[storybook + msw](https://github.com/mswjs/msw-storybook-addon) (mock BE response) 
[storybook + vitest](https://storybook.js.org/addons/@storybook/testing-react) (use stories as component for tests) 
[vsc icons](https://react-icons.github.io/react-icons/icons?name=vsc)

[vite](https://vitejs.dev/) 
[vitest](https://vitest.dev/) 

#### Visual studio code
[vsc extension overview](https://code.visualstudio.com/api/extension-guides/overview)
[vsc extension webview ](https://code.visualstudio.com/api/extension-guides/webview)
[How to Code a VSCode Extension](https://youtu.be/a5DX5pQ9p5M) (youtube) 
 

#### Visual studio code plugins
[tailwind vsc plugin](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 
[vitest vcs plugin](https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer) https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer

Scripts:
`dev:sidebar` - run web server with sidebar router
`dev:webview` - run web server with main webview router
`l10n:collect` - auto find all new strings and add them to `./l10n/bundle.l10n.json`
`storybook:dev` - run web storybook dev server
`package:prod` - package plugin as *.vsix file for prod
`package:stage` - package plugin as *.vsix file as prerelease build

`watch` - start node part of the plugin in dev mode
`build` - build web part of the plugin and run in dev mode


The `F5` command starts 3 tasks :
  * dev mode for node vsc
  * dev mode for web view
  * open a new vsc instance with the plugin

`F5` is a shortcut to start the "Run and Debug" => "Run Dev Extension" task

To run only vsc instance without background dev tasks chose: 
  "Run and Debug" => "Run only Extension"
