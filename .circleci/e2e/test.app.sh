#!/bin/bash
set -e

yarn --cwd tests/e2e install

# create folder before tests run to prevent permissions issue
mkdir -p tests/e2e/remote

# run rte
docker-compose -f tests/e2e/rte.docker-compose.yml build
docker-compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
./tests/e2e/wait-for-redis.sh localhost 12000 && \

# run tests
RI_SOCKETS_CORS=true \
yarn --cwd tests/e2e dotenv -e .ci.env yarn --cwd tests/e2e test:ci
