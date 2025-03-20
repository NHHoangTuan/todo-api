# Todo List API

A RESTful API for managing tasks with dependencies, built with Node.js, Express, and MongoDB.

## Features

- CRUD operations for tasks (Create, Read, Update, Delete)
- Task dependencies management
- Circular dependency detection
- Caching for improved performance
- Filtering and pagination

## Prerequisites

- Node.js (v14+)
- MongoDB

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/todo-api.git
cd todo-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo-api
NODE_ENV=development
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Docker Setup

To run the application using Docker:

```bash
docker-compose up
```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks (with filtering and pagination)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Dependencies

- `POST /api/dependencies/tasks/:taskId/dependencies/:dependencyId` - Add a dependency
- `DELETE /api/dependencies/tasks/:taskId/dependencies/:dependencyId` - Remove a dependency
- `GET /api/dependencies/tasks/:taskId/dependencies` - Get all dependencies (direct and indirect)

## API Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the todo API project",
    "dueDate": "2023-05-30",
    "priority": "high"
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

With filtering and pagination:

```bash
curl http://localhost:3000/api/tasks?priority=high&status=pending&page=1&limit=10
```

### Add a Dependency

```bash
curl -X POST http://localhost:3000/api/dependencies/tasks/taskId/dependencies/dependencyId
```

## Database Schema

### Task Model

- `title` (String, required): Task title
- `description` (String): Task description
- `dueDate` (Date): Due date for the task
- `priority` (String): Task priority (low, medium, high)
- `status` (String): Task status (pending, in-progress, completed)
- `dependencies` (Array of ObjectIds): References to tasks that this task depends on
