# MT E-Commerce — Backend

> Production-ready MERN Stack E-Commerce Backend for a Premium Men's Clothing Brand.

## Architecture

This project follows a **feature-based modular MVC architecture** with strict layered separation:

```
Route → Validator (Zod) → Controller → Service → Repository → Model → MongoDB
```

### Layer Rules

| Layer | Responsibility | Restrictions |
|-------|---------------|-------------|
| **Route** | URL mapping only | No logic |
| **Controller** | Parse request, call service, send response | No DB, no business logic |
| **Service** | Business logic, orchestration | No direct Mongoose calls |
| **Repository** | Data access (Mongoose CRUD) | No business logic |
| **Model** | Schema, indexes, virtuals | No business logic |
| **Middleware** | Single responsibility (auth, validation, etc.) | No mixed concerns |

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB 7 (Mongoose 8)
- **Cache**: Redis 7 (ioredis)
- **Auth**: JWT + Refresh Tokens + Google OAuth
- **Payments**: Stripe
- **Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (or local MongoDB + Redis)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.development

# Start MongoDB & Redis via Docker
npm run docker:up

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |

## API

Base URL: `http://localhost:5000/api/v1`

### Health Check

```
GET /api/v1/health
```

## Project Structure

```
src/
├── modules/         # Feature-based modules (auth, users, products, etc.)
├── config/          # Configuration (DB, Redis, env, etc.)
├── middlewares/      # Global middlewares
├── utils/           # Reusable utilities
├── helpers/         # Business-adjacent helpers
├── events/          # Event emitters
├── jobs/            # Background jobs
├── cache/           # Redis cache layer
├── docs/            # Swagger/OpenAPI docs
├── tests/           # Test setup & integration tests
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## License

ISC
