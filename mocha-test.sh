#!/bin/bash

# run: npm test or npm test TEST_NAME

if [ -z $1 ]; then set $1 '.'; fi

NODE_ENV=test \
HOST=0.0.0.0 \
PORT=88 \
nyc mocha --exit --grep $1