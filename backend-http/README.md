# Chess Game Backend API

A robust Express.js backend for the Chess game application with Prisma ORM and PostgreSQL.

## 📁 Project Structure

```
backend-http/
├── db/
│   ├── .env                      # Database environment variables
│   ├── prisma.config.ts          # Prisma configuration
│   └── prisma/
│       └── schema.prisma         # Database schema definition
├── src/
│   ├── controllers/              # Request handlers
│   │   ├── health.controller.ts
│   │   └── game.controller.ts
│   ├── middleware/               # Express middleware
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── routes/                   # API routes
│   │   ├── health.routes.ts
│   │   └── game.routes.ts
│   ├── services/                 # Business logic layer
│   │   └── game.service.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   └── prisma.ts             # Prisma client singleton
│   ├── app.ts                    # Express app setup
│   └── index.ts                  # Entry point
├── .env.example                  # Environment variables template
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example db/.env
```

Edit `db/.env` and add your database URL.

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/db` - Database connection check

### Games
- `GET /api/games` - List all games (optional: `?status=ongoing`)
- `GET /api/games/:id` - Get game by ID
- `POST /api/games` - Create a new game
- `POST /api/games/:id/join` - Join an existing game
- `POST /api/games/:id/move` - Make a move in a game
- `DELETE /api/games/:id` - Delete a game

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:reset` | Reset database (WARNING: deletes data) |

## 🗄️ Database Schema

The application uses the following models:

- **User** - Player information
- **Game** - Chess game session state
- **GamePlayer** - Junction table linking users to games with colors
- **Move** - Move history for each game

## 📝 Example Requests

### Create a Game
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "color": "white"}'
```

### Join a Game
```bash
curl -X POST http://localhost:3000/api/games/1/join \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}'
```

### Make a Move
```bash
curl -X POST http://localhost:3000/api/games/1/move \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "from": "e2", "to": "e4", "piece": "P", "fen": "..."}'
```

## 🧪 Testing the API

You can test the API using:
- **cURL** - Command line tool
- **Postman** - GUI API tester
- **Prisma Studio** - `npm run prisma:studio` to view database

## 🔒 Security Notes

1. In production, hash passwords using bcrypt
2. Implement JWT authentication
3. Set specific CORS origins instead of `*`
4. Use HTTPS in production
5. Implement rate limiting
