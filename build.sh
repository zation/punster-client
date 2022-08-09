#!/usr/bin/env bash

REPOSITORY=registry.cn-beijing.aliyuncs.com/vlinkbtc/punster
CI_BUILD_TAG=${1:-latest}
ENV=${2:-production}

yarn
VERSION=${CI_BUILD_TAG} yarn build
docker buildx build --no-cache --platform linux/amd64 --push -t ${REPOSITORY}:${CI_BUILD_TAG} .
git tag ${CI_BUILD_TAG}
git push origin --tags
