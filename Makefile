# Build and run the backend service
docker-backend:
	docker build -t backend ./backend && docker run -p 7004:7004 backend

# Build and run the frontend service
docker-frontend:
	docker build -t frontend ./frontend && docker run -p 3000:3000 frontend

# Start all services using Docker Compose
docker-up:
	docker-compose up --build -d

# Stop all running containers
docker-down:
	docker-compose down

# Restart all services
docker-restart:
	docker-compose down && docker-compose up --build -d

# Show running containers
docker-ps:
	docker ps

# View logs of backend service
docker-logs-backend:
	docker logs -f $(docker ps -q --filter ancestor=backend)

# View logs of frontend service
docker-logs-frontend:
	docker logs -f $(docker ps -q --filter ancestor=frontend)

# Run ESLint to fix formatting issues
lint-backend:
	@echo "Linting code..."
	npx eslint --config backend/eslint.config.js "backend/**/*.js" --fix && npx prettier --write "backend/**/*.js"
	
start-backend:
	cd backend && node server.js