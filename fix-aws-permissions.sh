#!/bin/bash

# Fix AWS EC2 Docker permissions for MySafety platform
echo "🔧 Fixing Docker permissions for MySafety on AWS EC2..."

# Set proper ownership for the app directory
sudo chown -R $USER:$USER .

# Make sure Docker has the right permissions
sudo chmod -R 755 .

# Fix any node_modules permission issues
rm -rf node_modules package-lock.json

echo "✅ Permissions fixed! Ready to deploy MySafety platform."