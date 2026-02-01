# Community Marketplace - Makefile
# Common commands for development and deployment

.PHONY: install dev build test migrate seed lint clean help frontend backend serve

# Default target
help:
	@echo "Community Marketplace - Available Commands"
	@echo "==========================================="
	@echo ""
	@echo "Frontend (Phase 1):"
	@echo "  make serve       - Start frontend with Python http.server (port 8000)"
	@echo "  make serve-node  - Start frontend with Node serve (port 5500)"
	@echo "  make open        - Open the website in browser"
	@echo ""
	@echo "Full Stack (Phase 2+):"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start all development servers"
	@echo "  make dev-frontend- Start frontend only"
	@echo "  make dev-backend - Start backend only"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run all tests"
	@echo "  make migrate     - Run database migrations"
	@echo "  make seed        - Seed the database"
	@echo "  make lint        - Run linter"
	@echo "  make clean       - Clean build artifacts"

# ================================
# Phase 1: Frontend Only
# ================================

# Serve frontend using Python (no dependencies required)
serve:
	@echo "Starting frontend server at http://localhost:8000"
	@echo "Open http://localhost:8000/frontend/pages/index.html in your browser"
	@echo "Press Ctrl+C to stop"
	python3 -m http.server 8000

# Serve frontend using Node.js serve package
serve-node:
	@echo "Starting frontend server at http://localhost:5500"
	@cd frontend && npx serve -l 5500

# Open the website in the default browser
open:
	@xdg-open http://localhost:8000/frontend/pages/index.html 2>/dev/null || \
	 open http://localhost:8000/frontend/pages/index.html 2>/dev/null || \
	 echo "Please open http://localhost:8000/frontend/pages/index.html in your browser"

# ================================
# Phase 2+: Full Stack
# ================================

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	@if [ -d "backend" ]; then cd backend && npm install; else echo "Backend not yet created (Phase 2)"; fi
	@echo "Done!"

# Development servers
dev: 
	@echo "Starting development server..."
	@if [ -d "backend" ]; then cd backend && npm run dev; else make serve; fi

dev-frontend:
	@echo "Starting frontend server..."
	@cd frontend && npx serve -l 5500

dev-backend:
	@echo "Starting backend server..."
	@if [ -d "backend" ]; then cd backend && npm run dev; else echo "Backend not yet created (Phase 2)"; fi

# Build for production
build:
	@echo "Building for production..."
	cd backend && npm run build

# Run tests
test:
	@echo "Running tests..."
	cd backend && npm test

# Database operations
migrate:
	@echo "Running migrations..."
	cd backend && npm run migrate

migrate-down:
	@echo "Rolling back last migration..."
	cd backend && npm run migrate:down

seed:
	@echo "Seeding database..."
	cd backend && npm run seed

setup-db:
	@echo "Setting up database..."
	cd backend && npm run db:setup

# Linting
lint:
	@echo "Running linter..."
	cd backend && npm run lint

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/node_modules
	rm -rf backend/dist
	@echo "Clean complete!"

# Initialize new project
init:
	@echo "Initializing project..."
	cp backend/.env.example backend/.env
	@echo "Created .env file - please update with your configuration"
	make install
	@echo "Project initialized successfully!"
