# Address-Mapper

## Steps

> Prequisite: Docker client should be running, env's should be added ( this will just make sure the third party apis are working )

1. Clone the repo

2. Add environment variables in /backend 

3. Update variable `API_URL` and set it to localhost url [web/src/config/constant.js](./web/src/config/constant.js)

4. On project root terminal run 

```bash
make service
```

## More commands 

1️⃣ Lint and Format the Backend Code
make lint-backend
Fixes ESLint errors in the backend code (backend/**/*.js).
Formats code using Prettier for consistent styling.
2️⃣ Start the Backend
make start-backend
Navigates to the backend directory and starts the Node.js Express server.
Runs on port 7004 by default.
3️⃣ Start the Frontend
make start-web
Navigates to the web directory and starts the SvelteKit frontend.
Runs the frontend on port 5173 by default.
4️⃣ Start the Full Application with Docker
make service
Runs the entire application using Docker Compose.
Automatically builds and starts:
Frontend (SvelteKit)
Backend (Node.js)
MongoDB database
Ensures everything is containerized for easy deployment.
5️⃣ Build the Docker Containers
make service-build
Builds all Docker containers without starting them.
Useful if you want to prepare images before deployment.
6️⃣ Stop the Running Services
make service-stop
Stops all running Docker containers gracefully.
Preserves database data (since MongoDB runs in a Docker volume).

