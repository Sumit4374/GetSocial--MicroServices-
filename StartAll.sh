clear
echo "building all services"
sleep 3
./build_services.sh
echo "Services built successfully"
sleep 2
echo "building client"
sleep 1
./build_client.sh
echo "Client built successfully"
sleep 1
echo "Services and client built successfully"
sleep 1
echo "Starting all services using docker-compose"
docker-compose up -d --build