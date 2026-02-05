# 🚀 Production Deployment Guide - MetaOS

## Infrastructure Requirements
- **PostgreSQL 14+**: Main database.
- **Redis 6.2+**: For caching and security nonces.
- **MongoDB Atlas (Vector Search enabled)**: For RAG capabilities.
- **Azure OpenAI Service**: GPT-4o and Text-Embedding-Ada-002 deployments.

## Environment Variables
Ensure the following are set in the production environment:
```env
# Security
JWT_SECRET=your-high-entropy-secret
TAT_SECRET=your-tenant-token-secret

# Databases
DB_HOST=your-postgres-host
DB_USERNAME=misy_admin
DB_PASSWORD=secure-password
REDIS_HOST=your-redis-host
REDIS_PORT=6380
REDIS_TLS=true

# AI (Azure)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

## Deployment Steps
1. **Migrations**: Run `npm run migration:run` to set up the database schema.
2. **Secrets**: Initialize the Owner Tenant (Colombiatic) using the management CLI.
3. **Build**: `npm run build`
4. **Run**: `npm run start:prod`

## Monitoring
- **Health Check**: `GET /health`
- **Metrics**: Integrated with Prometheus/Grafana via standard NestJS interceptors.
- **Logs**: Structured JSON logs emitted to stdout for ELK/Datadog ingestion.
