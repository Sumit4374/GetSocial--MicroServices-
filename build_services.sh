cd ./Services/api_gateway && mvn package -DskipTests
cd ../auth_service && mvn package -DskipTests 
cd ../chat-service && mvn package -DskipTests 
cd ../comment_service && mvn package -DskipTests 
cd ../discovery_service && mvn package -DskipTests
cd ../like_service && mvn package -DskipTests 
cd ../notification_service && mvn package -DskipTests
cd ../post_service && mvn package -DskipTests
cd ../user_service && mvn package -DskipTests && cd ../../

sleep 1
