# End-to-End Testing Guide for Redis-for-VS-Code

## Prerequisites

### 1. Install Dependencies and Build the Extension

The E2E tests use [`vscode-extension-tester`](https://github.com/redhat-developer/vscode-extension-tester), which sets up a fresh VS Code environment with Selenium and a Chromium driver.

Run the following commands to prepare everything:

```bash
yarn install
yarn install:deps
yarn install:extension
```

### 2. Start Redis Test Instances

The tests require several Redis instances to be running. Use the provided Docker Compose setup to start them:

```bash
docker compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
```

For the most up-to-date command, refer to:

- `.github/e2e/test.app.sh` script
- or the workflow file: `.github/workflows/tests-e2e-linux.yml` (Job: `Run tests`)

---

## Running Tests Locally

Navigate to the `tests/e2e` directory before running the commands below.

### Run all E2E tests

```bash
LOCAL_RUN=true yarn test:ci
```

### Run tests without EULA checks

```bash
SKIP_EULA_TESTS=true LOCAL_RUN=true yarn test:ci
```

---

## Local Environment Notes

### Reset the Work Directory

The extension stores settings in a local work directory. If you want to simulate a clean install, remove the RedisInsight database:

```bash
rm ~/.redis-for-vscode-stage/redisinsight.db
```

### Run a Specific Test File

To run a specific test suite, set the `TEST_FILES` environment variable to its path:

```bash
export TEST_FILES=dist/tests/setup.js
```

---

## Environment Variables

TOOD: add description for this

```bash
OSS_STANDALONE_DATABASE_NAME=127.0.0.1:8100
OSS_STANDALONE_V5_DATABASE_NAME=127.0.0.1:8101
OSS_STANDALONE_REDISEARCH_DATABASE_NAME=127.0.0.1:8102
OSS_STANDALONE_BIG_DATABASE_NAME=127.0.0.1:8103
OSS_STANDALONE_TLS_DATABASE_NAME=127.0.0.1:8104
OSS_STANDALONE_EMPTY_DATABASE_NAME=127.0.0.1:8105
OSS_STANDALONE_REDISGEARS_DATABASE_NAME=127.0.0.1:8106
OSS_CLUSTER_REDISGEARS_2_NAME=127.0.0.1:8207
OSS_STANDALONE_V7_DATABASE_NAME=127.0.0.1:8108
OSS_CLUSTER_DATABASE_NAME=127.0.0.1:8200
```
