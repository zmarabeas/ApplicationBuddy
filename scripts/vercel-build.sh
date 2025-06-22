#!/bin/bash

# Vercel build script to handle Rollup native dependency issues
set -e

echo "Starting Vercel build..."

# Set environment variables to handle Rollup issues
export NODE_OPTIONS="--max-old-space-size=4096"
export ROLLUP_SKIP_NATIVE=true

# Clean install with optional dependencies disabled
npm ci --omit=optional

# Build the client
npm run build:client

echo "Vercel build completed successfully!" 