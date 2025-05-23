# <img src="https://github.com/RedisInsight/Redis-for-VS-Code/blob/main/src/resources/256x256.png?raw=true" alt="logo" width="25"/>  Redis for VS Code

Redis for VS Code is the official Visual Studio Code extension that provides an intuitive and efficient GUI for Redis databases, developed by Redis.

![Redis for VS Code](https://github.com/RedisInsight/Redis-for-VS-Code/blob/main/.github/Redis_for_VS_Code_main_screen.png?raw=true)

## Key features:
* Universal Redis Support: Connect to any Redis instance, including Redis Community Edition, Redis Cloud, Redis Software, and Redis on Azure Cache.
* Advanced Connectivity: Supports TLS certificates and SSH tunnels, with an option for automatic data decompression for GZIP, SNAPPY, Brotli, and more.
* Data types: Supports strings, hashes, lists, sets, sorted sets, and JSON.
* Human-readable data representation: Offers formatters like ASCII, JSON, Binary, Hex, 32-bit, and 64-bit vectors, and other.
* Integrated Redis CLI: Leverage Redis CLI with syntax preview as you type commands.

For more details, check out the [release notes](https://github.com/RedisInsight/Redis-for-VS-Code/releases). 

## Get started with Redis for VS Code

This repository contains the source code for the Redis for VS Code extension.
You can install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=redis.redis-for-vscode) or download it from [Open VSX](https://open-vsx.org/).

## Running locally 

* Run following installation commands.

```yarn install```

```yarn download:backend```

* On the VS Code sidebar, click on the "Run and Debug" icon.
* Choose the "Run Dev Extension" configuration and click the run button next to it.
* Application will be ran in watch mode and new VS Code window should open.

## Feedback

We welcome your feedback and contributions to make Redis for VS Code even better. Here’s how you can get involved:

* Suggest a new [feature](https://github.com/RedisInsight/Redis-for-VS-Code/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=)
* Upvote [popular feature requests](https://github.com/RedisInsight/Redis-for-VS-Code/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc)
* Report a [bug](https://github.com/RedisInsight/Redis-for-VS-Code/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=%5BBUG%5D)

## Current limitations

If you encounter an error using Redis for VS Code with Visual Studio Code Remote Development, it may be due to an OS mismatch between your local and remote environments, which can lead to the wrong extension being installed remotely.
As an alternative, you can run Redis for VS Code locally and connect to your remote Redis database via SSH directly within the extension.

## Telemetry

Redis for VS Code includes an opt-in telemetry system to help us improve the developer experience. We respect your privacy — any data collected is anonymized. You can disable telemetry at any time via the extension’s settings page.

## License 
Redis for VS Code is licensed under the [SSPL](/LICENSE).
