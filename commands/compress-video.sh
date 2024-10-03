#!/bin/bash

bun run ./src/index.ts "$1" "${2:-ok}"

echo "Video compression completed!"