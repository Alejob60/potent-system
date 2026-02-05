# 🏗️ MetaOS: Viral Steam Engine - Technical Architecture

## Overview
MetaOS is a multi-tenant, agent-based orchestration system designed to automate viral content creation and customer engagement.

## Core Layers

### 1. Security Layer (The Shield)
- **TAT (Tenant Access Token)**: JWT-based tokens unique to each tenant.
- **HMAC + Nonce**: All mutation requests (POST/PUT) must be signed using a secret stored in the DB. Includes replay attack protection using Redis-backed nonces.
- **Rate Limiting**: Per-tenant request throttling to protect system resources.

### 2. Orchestration Layer (The Brain)
- **Front-Desk V2**: The intelligent gateway that receives all SDK and Omnichannel traffic.
- **Decision Engine**: Rule-based and AI-driven logic to route intents to specialized agents.
- **Tenant Context**: Automatic enrichment of every request with the business profile, branding, and industry data of the specific client.

### 3. Agent Layer (The Workers)
- **Base Class**: All agents extend `TenantBaseAgent` for mandatory data isolation.
- **Specialized Agents**: 
  - `video-scriptor`: Viral script generation.
  - `sales-assistant`: Lead qualification and product info.
  - `trend-scanner`: External market analysis.

### 4. Persistence Layer (The Memory)
- **PostgreSQL**: Source of truth for tenants, tokens, and long-term context.
- **Redis**: High-speed cache for sessions, security nonces, and rate limits.
- **MongoDB Vectorial**: RAG (Retrieval Augmented Generation) for semantic memory.

## Data Isolation
Strict isolation is enforced at three levels:
1. **DB Level**: `tenantId` column mandatory in all entities.
2. **Cache Level**: Keys prefixed with `tenant:{id}:`.
3. **Logic Level**: `TenantBaseAgent` validates ownership before execution.
