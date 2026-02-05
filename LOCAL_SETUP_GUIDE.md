# Local Development Setup Guide

This guide will help you set up and run the MisyBot AI Agent Platform locally on your Windows machine.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **MongoDB** (v4.4 or higher)
4. **Redis** (v6 or higher)
5. **Git**
6. **npm** or **yarn**

## Installation Steps

### 1. Install Required Software

#### PostgreSQL
1. Download PostgreSQL from https://www.postgresql.org/download/
2. Install with default settings
3. Note the password you set for the `postgres` user

#### MongoDB
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install with default settings

#### Redis
1. Download Redis for Windows from https://github.com/tporadowski/redis/releases
2. Extract and run `redis-server.exe`

### 2. Clone the Repository

```bash
git clone <repository-url>
cd misy-agent
```

### 3. Set Up Backend

1. Navigate to the backend directory:
   ```bash
   cd backend-refactor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the database:
   ```sql
   CREATE DATABASE meta_agent_db;
   ```

4. Run database migrations:
   ```bash
   npm run typeorm migration:run
   ```

5. Initialize MongoDB:
   ```bash
   node scripts/init-mongodb.js
   ```

### 4. Set Up Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### 1. Start Backend Services

1. Make sure PostgreSQL, MongoDB, and Redis are running
2. Navigate to the backend directory:
   ```bash
   cd backend-refactor
   ```
3. Start the backend:
   ```bash
   npm run start:dev
   ```

The backend will be available at http://localhost:3007

### 2. Start Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the frontend:
   ```bash
   npm start
   ```

The frontend will be available at http://localhost:3000

## Testing the Setup

### Backend API
- Swagger UI: http://localhost:3007/api-docs
- Health check: http://localhost:3007/api/health

### Frontend
- Main application: http://localhost:3000
- Login page: http://localhost:3000/login

## Environment Variables

The application uses environment variables for configuration. Make sure the following files are properly configured:

### Backend (.env.local)
- Database connection settings
- Redis connection settings
- MongoDB connection settings
- API keys for external services

### Frontend (.env)
- Backend URL
- API keys for external services

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3007, 5432, 27017, and 6379 are available
2. **Database connection errors**: Verify database credentials and ensure services are running
3. **Missing dependencies**: Run `npm install` in both backend and frontend directories

### Useful Commands

#### Backend
```bash
# Run tests
npm test

# Run specific test
npm run test:e2e

# Check code formatting
npm run lint

# Format code
npm run format
```

#### Frontend
```bash
# Run tests
npm test

# Build for production
npm run build
```

## Development Workflow

1. Make changes to the code
2. The development server will automatically reload
3. Test your changes
4. Commit and push your changes

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeORM Documentation](https://typeorm.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)