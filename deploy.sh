#!/bin/bash

# Hostinger Git Deployment Script
# This script will be executed by Hostinger when deploying from Git

echo "Starting Creative Budget App deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Build the application
echo "Building application for production..."
npm run build:prod

# Copy built files to web directory
echo "Copying files to web directory..."
if [ -d "dist/budget-angular-app" ]; then
    cp -r dist/budget-angular-app/* ./
    echo "Files copied successfully"
else
    echo "Build directory not found. Checking alternative paths..."
    if [ -d "dist" ]; then
        # Find the actual build directory
        BUILD_DIR=$(find dist -type d -name "*" | head -1)
        if [ -n "$BUILD_DIR" ]; then
            cp -r $BUILD_DIR/* ./
            echo "Files copied from $BUILD_DIR"
        fi
    fi
fi

# Copy .htaccess for Angular routing
if [ -f ".htaccess" ]; then
    cp .htaccess ./
    echo ".htaccess copied"
fi

echo "Deployment completed successfully!"
