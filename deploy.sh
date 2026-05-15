echo "This will stop and remove wallet container, then remove wallet v2 image and create and run new image"

echo "Stopping docker for nft-backend-service...."
docker stop nft-backend-service 2>/dev/null || echo "No existing container"

echo "Removing docker for nft-backend-service...."
docker rm nft-backend-service 2>/dev/null || echo "Container already removed"

echo "Removing docker image for nft-backend-services-image..."
docker image rm nft-backend-services-image:latest 2>/dev/null || echo "No existing image"

echo "Building docker image for nft-backend-service...."
docker build -t nft-backend-services-image:latest .

echo "Running docker image for nft-backend-service...."
docker run -d \
  --name nft-backend-service \
  --restart=always \
  -p 2700:2700 \
  -e NODE_ENV=production \
  nft-backend-services-image:latest

echo "DONE!"
