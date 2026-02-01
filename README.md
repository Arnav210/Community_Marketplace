# Community Marketplace

A full-stack web application for buying and selling items within a community.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (SQLite for development)
- **Authentication:** JWT with bcrypt password hashing

## Project Structure

```
/project-root
├── frontend/
│   ├── pages/        # HTML pages
│   ├── css/          # Stylesheets (one per page)
│   ├── js/           # JavaScript (one per feature/page)
│   └── assets/       # Images, icons, fonts
│
├── backend/
│   ├── src/
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, etc.
│   │   └── models/       # Database models
│   ├── migrations/       # SQL migrations
│   └── seed/             # Seed data
│
├── .github/workflows/    # CI/CD pipelines
├── Makefile              # Common commands
├── README.md
└── LICENSE
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (or SQLite for development)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Community_Marketplace

# Install dependencies
make install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit .env with your configuration

# Run database migrations
make migrate

# Seed the database (optional)
make seed

# Start development server
make dev
```

## Available Commands

```bash
make install    # Install all dependencies
make dev        # Start development server
make build      # Build for production
make test       # Run tests
make migrate    # Run database migrations
make seed       # Seed the database
make lint       # Run linter
make clean      # Clean build artifacts
```

## Pages

- **Home** (`/`) - Landing page with featured listings
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Dashboard** (`/dashboard`) - User's personal dashboard (protected)
- **Listings** (`/listings`) - Browse all marketplace listings
- **Listing Detail** (`/listing/:id`) - View single listing details
- **Create Listing** (`/create-listing`) - Post a new listing (protected)
- **Profile** (`/profile`) - User profile management (protected)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (protected)
- `PUT /api/listings/:id` - Update listing (protected)
- `DELETE /api/listings/:id` - Delete listing (protected)

## Environment Variables

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
