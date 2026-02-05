# Tenant Isolation Design Document

## Overview

This document outlines the design for implementing tenant isolation mechanisms across all data stores in the MisyBot multitenant system. The goal is to ensure complete data separation between tenants while maintaining performance and scalability.

## PostgreSQL Row-Level Security (RLS) Implementation

### Design Approach

1. **Tenant Identifier Column**: Add a `tenant_id` column to all tables that store tenant-specific data
2. **RLS Policies**: Create policies that automatically filter queries based on the current tenant context
3. **Context Propagation**: Implement middleware that sets the tenant context for each request

### Implementation Details

```sql
-- Add tenant_id column to tables
ALTER TABLE users ADD COLUMN tenant_id VARCHAR(50) NOT NULL;
ALTER TABLE conversations ADD COLUMN tenant_id VARCHAR(50) NOT NULL;
ALTER TABLE messages ADD COLUMN tenant_id VARCHAR(50) NOT NULL;

-- Create RLS policies
CREATE POLICY tenant_isolation_policy ON users 
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY tenant_isolation_policy ON conversations 
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY tenant_isolation_policy ON messages 
  USING (tenant_id = current_setting('app.tenant_id'));

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### Context Propagation

```typescript
// Middleware to set tenant context
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'];
    if (tenantId) {
      // Set tenant context in database session
      this.databaseService.setTenantContext(tenantId);
    }
    next();
  }
}
```

## MongoDB Tenant-Specific Collections

### Design Approach

1. **Database-per-Tenant**: Each tenant gets its own database with identical schema
2. **Collection Naming**: Use consistent naming conventions for tenant collections
3. **Connection Management**: Implement connection pooling per tenant

### Implementation Details

```typescript
// Tenant-specific database connection
export class TenantMongoService {
  private tenantConnections: Map<string, Db> = new Map();

  async getTenantDb(tenantId: string): Promise<Db> {
    if (!this.tenantConnections.has(tenantId)) {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(`tenant_${tenantId}`);
      this.tenantConnections.set(tenantId, db);
    }
    return this.tenantConnections.get(tenantId);
  }
}
```

## Redis Namespace Separation

### Design Approach

1. **Key Prefixing**: Use tenant ID as prefix for all Redis keys
2. **Namespace Management**: Implement utilities for consistent key naming
3. **Cache Isolation**: Ensure tenant-specific caching without cross-contamination

### Implementation Details

```typescript
// Redis tenant namespace service
@Injectable()
export class TenantRedisService {
  constructor(private readonly redisService: RedisService) {}

  private getTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  async set(tenantId: string, key: string, value: string): Promise<void> {
    const tenantKey = this.getTenantKey(tenantId, key);
    await this.redisService.set(tenantKey, value);
  }

  async get(tenantId: string, key: string): Promise<string> {
    const tenantKey = this.getTenantKey(tenantId, key);
    return this.redisService.get(tenantKey);
  }
}
```

## Tenant Context Propagation

### Design Approach

1. **Request Context**: Extract tenant ID from request headers
2. **Service Injection**: Inject tenant context into all services
3. **Data Access Layer**: Ensure all data access methods are tenant-aware

### Implementation Details

```typescript
// Tenant context service
@Injectable()
export class TenantContextService {
  private readonly clsService: ClsService;

  constructor(clsService: ClsService) {
    this.clsService = clsService;
  }

  setTenantId(tenantId: string): void {
    this.clsService.set('tenantId', tenantId);
  }

  getTenantId(): string {
    return this.clsService.get('tenantId');
  }
}

// Tenant-aware repository
@Injectable()
export class TenantAwareRepository {
  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly databaseService: DatabaseService
  ) {}

  async findUsers(): Promise<User[]> {
    const tenantId = this.tenantContextService.getTenantId();
    return this.databaseService.findUsersByTenant(tenantId);
  }
}
```

## Security Considerations

1. **Access Control**: Ensure only authorized services can set tenant context
2. **Validation**: Validate tenant IDs to prevent injection attacks
3. **Auditing**: Log all tenant context changes for security auditing
4. **Error Handling**: Prevent information leakage through error messages

## Performance Optimization

1. **Connection Pooling**: Implement efficient connection pooling for database connections
2. **Caching**: Use Redis caching to reduce database load
3. **Query Optimization**: Optimize queries to work efficiently with RLS
4. **Indexing**: Create indexes on tenant_id columns for faster filtering

## Testing Strategy

1. **Unit Tests**: Test isolation mechanisms in isolation
2. **Integration Tests**: Verify tenant isolation across services
3. **Security Tests**: Validate that tenants cannot access each other's data
4. **Performance Tests**: Ensure isolation doesn't significantly impact performance