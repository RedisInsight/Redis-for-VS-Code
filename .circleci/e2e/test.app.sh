#!/bin/bash
set -e

# Moved to config.yml
# yarn --cwd tests/e2e install

# Create folder before tests run to prevent permissions issues
mkdir -p tests/e2e/remote

# Run RTE (Redis Test Environment)
docker-compose -f tests/e2e/rte.docker-compose.yml build
docker-compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
./tests/e2e/wait-for-redis.sh localhost 12000

# Run tests with the split files
if [ -z "$TEST_FILES" ]; then
  echo "No TEST_FILES specified, running all tests..."
  RI_SOCKETS_CORS=true yarn --cwd tests/e2e dotenv -e .ci.env yarn --cwd tests/e2e test:ci
else
  echo "Running split tests: $TEST_FILES"
  RI_SOCKETS_CORS=true yarn --cwd tests/e2e dotenv -e .ci.env yarn --cwd tests/e2e test:ci --testFiles="$TEST_FILES"
fi
