# SocialMedia — Microservices

A containerized microservices-based social media platform with a React (Vite) client, Java/Maven services, Kafka for event streaming, PostgreSQL for persistence, and Eureka for service discovery. An API Gateway fronts the services. Everything runs locally via Docker Compose.

- Orchestration: [docker-compose.yml](docker-compose.yml)
- DB initialization: [init-databases.sql](init-databases.sql)
- Build scripts: [StartAll.sh](StartAll.sh), [build_services.sh](build_services.sh), [build_client.sh](build_client.sh)
- Client app: [client/](client), API base URL: http://localhost:8080

## Architecture

- Service discovery: Eureka ([Services/discovery_service](Services/discovery_service))
- API gateway: routes requests to downstream services ([Services/api_gateway](Services/api_gateway))
- Services (Java/Maven):
  - Auth: 8061 ([Services/auth_service](Services/auth_service))
  - Users: 8082 ([Services/user_service](Services/user_service))
  - Posts: 8083 ([Services/post_service](Services/post_service))
  - Comments: 8084 ([Services/comment_service](Services/comment_service))
  - Likes: 8085 ([Services/like_service](Services/like_service))
  - Chat: 8086 ([Services/chat-service](Services/chat-service))
  - Notifications: 8087 ([Services/notification_service](Services/notification_service))
- Data: PostgreSQL (single instance, multiple databases)
- Messaging: Kafka + Zookeeper
- Frontend: React + Vite + TypeScript + TailwindCSS ([client/](client))

### Networking (host ports)

- API Gateway: http://localhost:8080
- Client (Nginx): http://localhost:3000
- Eureka Dashboard: http://localhost:8761
- Kafka: localhost:9092 (internally at kafka:29092)
- PostgreSQL: localhost:5432

### Databases (auto-created on first run)

- socialmedia_auth
- socialmedia_users
- socialmedia_posts
- socialmedia_comments
- socialmedia_likes
- socialmedia_chat
- socialmedia_notifications

Created by [init-databases.sql](init-databases.sql) mounted into the Postgres container.

### Kafka topics (auto-created)

- post-events
- comment-events
- like-event
- user-events
- chat-messages

Created by the kafka-init container in [docker-compose.yml](docker-compose.yml).

## Repository layout

- [docker-compose.yml](docker-compose.yml): Full stack (DB, Kafka, Eureka, services, client)
- [StartAll.sh](StartAll.sh): Build all services and client, then run docker-compose
- [build_services.sh](build_services.sh): Packages all Java services with Maven
- [build_client.sh](build_client.sh): Installs and builds the React client
- [client/](client): React + Vite app
  - [package.json](client/package.json)
  - [src/App.tsx](client/src/App.tsx)
  - Hook for WS with STOMP + SockJS fallback: [client/src/hooks/useWebSocket.ts](client/src/hooks/useWebSocket.ts)
  - API utilities: [client/src/utils/api.ts](client/src/utils/api.ts)
  - Auth context: [client/src/contexts/AuthContext.tsx](client/src/contexts/AuthContext.tsx)
  - Pages: [client/src/pages/](client/src/pages)
  - Components: [client/src/components/](client/src/components)
- Services (Java/Maven)
  - [Services/api_gateway](Services/api_gateway)
  - [Services/auth_service](Services/auth_service)
  - [Services/user_service](Services/user_service)
  - [Services/post_service](Services/post_service)
  - [Services/comment_service](Services/comment_service)
  - [Services/like_service](Services/like_service)
  - [Services/chat-service](Services/chat-service)
  - [Services/notification_service](Services/notification_service)
  - [Services/discovery_service](Services/discovery_service)

## Prerequisites

- Docker and Docker Compose (v2 recommended)
- Bash (for the helper scripts)
- If building locally via scripts:
  - Java 17+ and Maven 3.9+ (for [build_services.sh](build_services.sh))
  - Node.js 18+ and npm (for [build_client.sh](build_client.sh))

## Environment configuration

The compose file references environment variables directly and also supports a project-level .env file (auto-loaded by Docker Compose).

Create a .env at the project root if you use Cloudinary uploads (Post Service):

```env
# .env at repository root
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Relevant environment variables per container are defined inline in [docker-compose.yml](docker-compose.yml). Notable ones:
- JWT secret (shared): `JWT_SECRET`
- Service DB URLs: `DB_URL` / `POSTGRES_URL`
- Kafka bootstrap servers: `KAFKA_BOOTSTRAP_SERVERS=kafka:29092`
- API gateway Eureka URL: `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/`
- Client: `VITE_API_BASE_URL=http://localhost:8080` (already set in compose)

## How to run

### Quick start (Docker Compose)

```sh
# from repo root
docker compose up -d --build
# or, if your Docker uses the old plugin
docker-compose up -d --build
```

- Client: http://localhost:3000
- API Gateway: http://localhost:8080
- Eureka: http://localhost:8761

To tail logs:

```sh
docker compose logs -f
```

To stop:

```sh
docker compose down
```

To stop and remove DB data:

```sh
docker compose down -v
```

### Build locally then run

```sh
# Build Java services (requires Java+Maven)
./build_services.sh

# Build client (requires Node.js)
./build_client.sh

# Start stack
docker compose up -d --build
```

Or all-in-one:

```sh
./StartAll.sh
```

## Client development

Run the client locally against the gateway:

```sh
cd client
npm install
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8080` (already done in compose; for local dev you can place it in client/.env).

WebSockets:
- STOMP over WebSocket with automatic SockJS fallback when native WebSocket is unavailable.
- See [client/src/hooks/useWebSocket.ts](client/src/hooks/useWebSocket.ts) for connection lifecycle, fallback logic, and message API.

Example fallback code (excerpt reference):
- [`client/src/hooks/useWebSocket.ts`](client/src/hooks/useWebSocket.ts)

```ts
// Swap to SockJS
// ...existing code...
client.deactivate().finally(() => {
  const sockClient = createClient(false);
  sockClient.activate();
  clientRef.current = sockClient;
});
// ...existing code...
```

## Services overview

Each service is a Java/Maven app packaged into a Docker image by [docker-compose.yml](docker-compose.yml). They register with Eureka and communicate via REST through the API Gateway and via Kafka for async events.

- Auth Service: Authentication/authorization (JWT)
- User Service: Profiles and follow graph
- Post Service: Posts, media (Cloudinary envs required)
- Comment Service: Comments on posts
- Like Service: Reactions/likes
- Chat Service: Messaging; integrates with Kafka; client uses STOMP/SockJS
- Notification Service: Consumes events to notify users
- Discovery Service: Eureka registry
- API Gateway: External entrypoint; routes to services

## Databases

Single PostgreSQL instance, separate databases per service. Databases are created on first boot by [init-databases.sql](init-databases.sql). Connection strings are injected via `DB_URL`/`POSTGRES_URL` per service in [docker-compose.yml](docker-compose.yml).

## Troubleshooting

- Services fail to connect to DB:
  - Ensure Postgres is healthy; wait for health checks to pass.
  - Databases are auto-created; restart the affected service after Postgres is ready.

- Kafka topic/connection errors:
  - Wait for `kafka` to be healthy; the `kafka-init` container creates topics.
  - Verify `KAFKA_BOOTSTRAP_SERVERS=kafka:29092`.

- Client can’t reach API:
  - Confirm gateway is listening on 8080.
  - Check `VITE_API_BASE_URL` in [docker-compose.yml](docker-compose.yml) or client `.env`.

- WebSocket not connecting:
  - The client falls back to SockJS automatically; see [client/src/hooks/useWebSocket.ts](client/src/hooks/useWebSocket.ts).

- Rebuild everything:
  ```sh
  docker compose down -v
  docker compose build --no-cache
  docker compose up -d
  ```

## Scripts reference

- [StartAll.sh](StartAll.sh): Build services and client, then start the stack
- [build_services.sh](build_services.sh): `mvn package -DskipTests` for each service
- [build_client.sh](build_client.sh): `npm install && npm run build` for the client

