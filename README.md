# Outbuild Project Setup

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Setup Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. Create a `.env` file in the project root with the following content:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=diego
   DB_PASS=gplatac95
   DB_NAME=outbuild
   ```
   Adjust the values as needed.

3. Start the database container:
   ```
   npm run db:up
   ```
   or
   ```
   docker-compose up -d
   ```

4. Install project dependencies:
   ```
   npm install
   ```

5. Run database migrations:
   ```
   npx sequelize-cli db:migrate
   ```

## Local Testing

### Prerequisites
- Docker and Docker Compose installed
- Node.js and npm installed
- PostgreSQL client (optional, for direct DB access)

### Setup and Run Tests
1. Create `.env` file in project root:

npm test
npm test -- path/to/test.js

## API Documentation

### Prerequisites
- Node.js and npm installed

### Generating Documentation
1. Install dependencies:

```
   npm install
```
2. Generate API documentation:

```
   npm run docs
```
3. View documentation:
- Open docs/index.html in your web browser
- Documentation includes all API endpoints, request/response formats, and examples

### Updating Documentation
- API documentation source is in apidoc/routes.js
- Make changes there and re-run npm run docs to update
- Configuration is in apidoc.json

## Additional Commands

- View Docker container logs:
  ```
  docker-compose logs
  ```

- Stop the database container:
  ```
  docker-compose down
  ```

- Undo all migrations:
  ```
  npx sequelize-cli db:migrate:undo:all
  ```

## Troubleshooting

- If you encounter permission issues with Docker, ensure your user is part of the `docker` group:
  ```
  sudo usermod -aG docker $USER
  ```
  Log out and log back in for the changes to take effect.

- If migrations fail, check your database connection settings in `.env` and `config/config.js`.

- If tests fail due to DB connection, ensure Docker container is running: docker ps


## Considerations and possible future enhancements
- User auth was not an explicit requirement so I avoided. JWT and API keys can be implemented for added security.
- Caching can be implemented w Redis but rn would be overkill.
- Connection pooling for database
- DTOs
