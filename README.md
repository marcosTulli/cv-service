
# API Documentation

## Overview

This API provides endpoints for managing users, authentication, work experience, education, skills, and icons. It is built with NestJS and MongoDB, with security enforced by API key guarding.

---

## Table of Contents

- [Setup](#setup)  
- [Authentication](#authentication)  
- [API Endpoints](#api-endpoints)  
- [Error Handling](#error-handling)  
- [Usage](#usage)

---

## Setup

### Prerequisites

- Node.js V22.14.0
- MongoDB instance (local or cloud)  
- API Key for accessing endpoints

### Environment Variables

Set up the following in your `.env` file:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
API_KEY=your_api_key_here
```

### Install dependencies

```bash
npm install
```

### Run the server

```bash
npm run start
```

The server will start on port `3000` by default.

---

## Authentication

All API endpoints are protected with an API key. You must include an `x-api-key` header in your requests:

```
x-api-key: your_api_key_here
```

---

## API Endpoints

### Auth

| Method | Endpoint    | Description      | Body                     |
|--------|-------------|------------------|--------------------------|
| POST   | `/auth/signup` | Register a new user | `{ email, name, password }` |
| POST   | `/auth/login`  | Login a user      | `{ email, password }`       |

---

### Users

| Method | Endpoint          | Description                       |
|--------|-------------------|---------------------------------|
| GET    | `/users`          | Get all users (without passwords) |
| GET    | `/users/:lang/:id`| Get user data localized by language (excluding password & info) |

---

### Work Experience

| Method | Endpoint                  | Description                      |
|--------|---------------------------|--------------------------------|
| GET    | `/work-experience/:lang/:userId` | Get work experience localized by language for a user |

---

### Education

| Method | Endpoint                  | Description                      |
|--------|---------------------------|--------------------------------|
| GET    | `/education/:lang/:userId`| Get education data localized by language for a user |

---

### Skills

| Method | Endpoint          | Description                      |
|--------|-------------------|--------------------------------|
| GET    | `/skills/:userId` | Get skills for a user (language-dependent) |

---

### Icons

| Method | Endpoint      | Description                  |
|--------|---------------|------------------------------|
| GET    | `/icons/:name`| Get icon data by icon name    |

---

## Error Handling

- Requests missing required parameters will return a `400 Bad Request`.
- Invalid MongoDB ObjectIds will return a `400 Bad Request`.
- Missing or invalid API keys will result in a `401 Unauthorized` response.

---

## Usage Example

Using `curl` to get all users:

```bash
curl -H "x-api-key: your_api_key_here" http://localhost:3000/users
```

Logging in a user:

```bash
curl -X POST -H "Content-Type: application/json" -H "x-api-key: your_api_key_here" -d '{"email":"test@example.com","password":"mypassword"}' http://localhost:3000/auth/login
```

---

## Notes

- All responses are JSON.
- Passwords are never returned in API responses.
- Language codes (`lang`) follow ISO 639-1 standards (e.g., `en`, `es`, `fr`).