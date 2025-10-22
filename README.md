# Social Media Microservices Platform

A complete microservices-based social media platform built with Spring Boot, PostgreSQL, and Kafka.

## 🏗️ Architecture

This project implements a microservices architecture with the following components:

### Core Services
- **Discovery Service** - Eureka service registry
- **API Gateway** - Single entry point for all client requests
- **Auth Service** - JWT-based authentication and authorization
- **User Service** - User profile management
- **Post Service** - Post creation and management
- **Comment Service** - Comment functionality
- **Like Service** - Like/unlike posts and comments
- **Chat Service** - Real-time messaging
- **Notification Service** - Event-driven notifications

### Infrastructure
- **PostgreSQL** - Relational database (single instance, multiple databases)
- **Apache Kafka** - Event streaming and message broker
- **Zookeeper** - Kafka coordination service

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17+ (for local development)
- Maven 3.6+ (for local development)
- 4GB+ RAM available

### Option 1: Using the Quick Start Script
```bash
./start-services.sh
```

### Option 2: Manual Docker Compose
```bash
# Build all services
./build-all.sh

# Start with docker-compose
docker-compose up -d

# Check status
docker-compose ps
```

### Option 3: Using Management Script
```bash
# Start services
./manage.sh start

# View logs
./manage.sh logs

# Check status
./manage.sh status
```

## 📚 Documentation

- **[DOCKER-SETUP.md](DOCKER-SETUP.md)** - Comprehensive Docker setup guide
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Quick command reference
- **[CHANGES.md](CHANGES.md)** - Detailed changes summary

## 🌐 Service Endpoints

| Service | Port | Description |
|---------|------|-------------|
| Eureka Dashboard | 8761 | Service registry UI |
| API Gateway | 8080 | Main entry point |
| Auth Service | 8061 | Authentication |
| User Service | 8082 | User management |
| Post Service | 8083 | Post operations |
| Comment Service | 8084 | Comments |
| Like Service | 8085 | Likes |
| Chat Service | 8086 | Messaging |
| Notification Service | 8087 | Notifications |

Access services through API Gateway:
- `http://localhost:8080/auth-service/...`
- `http://localhost:8080/user-service/...`
- `http://localhost:8080/post-service/...`
- etc.

## 🗄️ Database Structure

Single PostgreSQL instance with separate databases:
- `socialmedia_auth`
- `socialmedia_users`
- `socialmedia_posts`
- `socialmedia_comments`
- `socialmedia_likes`
- `socialmedia_chat`
- `socialmedia_notifications`

## 📨 Kafka Topics

- `post-events` - Post creation/updates
- `comment-events` - Comment creation/deletion
- `like-event` - Like/unlike events
- `user-events` - User registration/updates
- `chat-messages` - Chat messages

## 🛠️ Management Scripts

### manage.sh
```bash
./manage.sh start       # Start all services
./manage.sh stop        # Stop all services
./manage.sh restart     # Restart all services
./manage.sh logs        # View logs
./manage.sh status      # Check status
./manage.sh topics      # List Kafka topics
./manage.sh databases   # List databases
./manage.sh clean       # Clean everything
```

### build-all.sh
```bash
./build-all.sh          # Build all Maven projects
```

### start-services.sh
```bash
./start-services.sh     # Quick start everything
```

## 🔧 Development

### Running Services Locally
Services can run locally without Docker. Update application.properties with local values:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/database_name
spring.kafka.bootstrap-servers=localhost:9092
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

### Building a Single Service
```bash
cd Services/service-name
./mvnw clean package
```

### Running a Single Service
```bash
cd Services/service-name
java -jar target/service-name.jar
```

### Rebuilding After Code Changes
```bash
# Build the service
cd Services/user-service
./mvnw clean package -DskipTests

# Restart container
docker-compose up -d --build user-service
```

## 🐛 Troubleshooting

### Services Not Starting
```bash
# Check logs
docker-compose logs -f service-name

# Restart service
docker-compose restart service-name
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check databases
docker exec -it postgres-db psql -U root -c "\l"
```

### Kafka Connection Issues
```bash
# Check Kafka logs
docker-compose logs kafka

# List topics
docker exec -it kafka-broker kafka-topics --list --bootstrap-server localhost:9092
```

### Eureka Registration Issues
- Wait 30-60 seconds for services to register
- Check Eureka dashboard: http://localhost:8761
- Verify service logs for connection errors

## 📊 Monitoring

### Eureka Dashboard
Monitor service health and registration: http://localhost:8761

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service

# Multiple services
docker-compose logs -f kafka notification-service
```

### Database Monitoring
```bash
# Connect to PostgreSQL
docker exec -it postgres-db psql -U root -d socialmedia

# Check database sizes
docker exec -it postgres-db psql -U root -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;"
```

### Kafka Monitoring
```bash
# List topics
./manage.sh topics

# Describe topic
docker exec -it kafka-broker kafka-topics --describe --topic post-events --bootstrap-server localhost:9092

# Consumer groups
docker exec -it kafka-broker kafka-consumer-groups --list --bootstrap-server localhost:9092
```

## 🧪 Testing

### Health Check Endpoints
Most services expose health endpoints:
```bash
curl http://localhost:8082/actuator/health
```

### API Testing
Use the API Gateway for all requests:
```bash
curl http://localhost:8080/user-service/api/users
```

## 🔒 Security

- JWT-based authentication via Auth Service
- Secure inter-service communication via Eureka
- Environment-based configuration (sensitive data in .env files)
- Database credentials configurable via environment variables

## 🗑️ Cleanup

### Stop Services
```bash
docker-compose down
```

### Remove Everything (including data)
```bash
./manage.sh clean
# or
docker-compose down -v
```

## 📦 Project Structure

```
.
├── docker-compose.yml           # Docker Compose configuration
├── init-databases.sql          # Database initialization
├── build-all.sh                # Build script
├── start-services.sh           # Quick start script
├── manage.sh                   # Management script
├── DOCKER-SETUP.md            # Docker setup guide
├── QUICK-REFERENCE.md         # Quick reference
├── CHANGES.md                 # Changes summary
├── client/                    # Frontend application
└── Services/
    ├── discovery_service/     # Eureka server
    ├── api_gateway/          # API Gateway
    ├── auth_service/         # Authentication
    ├── user_service/         # User management
    ├── post_service/         # Posts
    ├── comment_service/      # Comments
    ├── like_service/         # Likes
    ├── chat-service/         # Chat
    └── notification_service/ # Notifications
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Build and test locally
4. Submit a pull request

## 📝 License

[Your License Here]

## 📞 Support

For issues and questions:
- Check [DOCKER-SETUP.md](DOCKER-SETUP.md) for detailed setup instructions
- Check [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for quick commands
- Review logs: `./manage.sh logs`
- Check service status: `./manage.sh status`

## 🎯 Roadmap

Future enhancements:
- [ ] Redis caching layer
- [ ] Distributed tracing (Zipkin/Jaeger)
- [ ] Centralized logging (ELK stack)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Load balancing (Nginx)
- [ ] Monitoring dashboard (Prometheus/Grafana)
- [ ] Configuration server (Spring Cloud Config)
- [ ] Circuit breakers (Resilience4j)

---

**Built with ❤️ using Spring Boot, PostgreSQL, and Kafka**
