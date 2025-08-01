#!/bin/bash

# SVGit4Me Docker Deployment Script

echo "🚀 Starting SVGit4Me Docker deployment..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t svgit4me .

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker stop svgit4me 2>/dev/null || true
docker rm svgit4me 2>/dev/null || true

# Run the new container
echo "▶️  Starting new container..."
docker run -d \
  --name svgit4me \
  -p 3000:3000 \
  --restart unless-stopped \
  svgit4me

echo "✅ Deployment complete!"
echo "🌐 Your application is now running at: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker logs svgit4me"
echo "  - Stop container: docker stop svgit4me"
echo "  - Remove container: docker rm svgit4me"
echo "  - View running containers: docker ps" 