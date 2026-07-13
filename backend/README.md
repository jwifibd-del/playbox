# PlayFlix Backend API

NestJS backend with TypeORM, PostgreSQL, and JWT auth.

For full project setup, including Ubuntu local server steps, see [../SETUP.md](../SETUP.md).

## Installation

```bash
cd backend
npm install
```

## Setup Database

### Option 1: Docker
```bash
# From project root
docker-compose up -d
```

### Option 2: Local PostgreSQL
- Create a database named 'playflix'
- Update .env file if needed (copy .env.example first)

## Running the app

```bash
# development (watch mode)
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Movies
- `GET /movies` - Get all movies
- `GET /movies/:id` - Get single movie
- `POST /movies` - Create movie (requires auth)
