1. Clone the generated student repository.
2. Install frontend dependencies with `npm install --prefix frontend`.
3. Run backend tests with `mvn -f backend/pom.xml test`.
4. Package the backend with `mvn -f backend/pom.xml -q -DskipTests package`.
5. Build the frontend with `npm run build --prefix frontend` and deploy both services through Render using the generated `render.yaml`.
6. Keep `/health`, `/api/version`, and `/api/ping` operational while implementing the ticket workflow.
