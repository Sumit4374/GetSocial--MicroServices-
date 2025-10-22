-- Create all databases for microservices
-- Note: CREATE DATABASE doesn't support IF NOT EXISTS in PostgreSQL
-- This script runs only once during container initialization

SELECT 'CREATE DATABASE socialmedia_auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_auth')\gexec

SELECT 'CREATE DATABASE socialmedia_users'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_users')\gexec

SELECT 'CREATE DATABASE socialmedia_posts'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_posts')\gexec

SELECT 'CREATE DATABASE socialmedia_comments'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_comments')\gexec

SELECT 'CREATE DATABASE socialmedia_likes'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_likes')\gexec

SELECT 'CREATE DATABASE socialmedia_chat'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_chat')\gexec

SELECT 'CREATE DATABASE socialmedia_notifications'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialmedia_notifications')\gexec
