# NestJS CV API

A comprehensive RESTful API built with NestJS for managing user profiles, CVs, work experience, education, skills, and more. This application provides a robust backend solution for portfolio and CV management systems with multilingual support.

## 🚀 Features

- **User Management**: Complete user CRUD operations with role-based access
- **Authentication**: JWT-based authentication with secure login/signup
- **Profile Management**: Comprehensive profile management with multilingual support
- **Work Experience**: Track and manage work history
- **Education**: Educational background management
- **Skills**: Skills and competencies tracking
- **Icons**: Icon management system
- **API Documentation**: Interactive Swagger documentation
- **Security**: API key authentication and JWT guards
- **Database**: MongoDB integration with Mongoose ODM

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Language**: TypeScript
- **Package Manager**: Yarn
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v22.14.0 or higher)
- MongoDB instance
- Yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-cv-api
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=CVDB
   JWT_SECRET=your-super-secret-jwt-key
   API_KEY=your-api-key-here
   ```

4. **Start the application**
   ```bash
   # Development
   yarn start:dev
   
   # Production
   yarn build
   yarn start:prod
   ```

## 🌐 API Documentation

Once the application is running, you can access the interactive Swagger documentation at:

**http://localhost:8080/api**

This provides a complete overview of all available endpoints, request/response schemas, and allows you to test the API directly from the browser.

## 📁 Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── auth/                      # Authentication module
│   ├── auth.controller.ts     # Auth endpoints
│   ├── auth.service.ts        # Auth business logic
│   ├── auth.module.ts         # Auth module configuration
│   ├── dto/                   # Data transfer objects
│   ├── guard/                 # JWT guards
│   └── strategy/              # JWT strategy
├── user/                      # User management
│   ├── user.controller.ts     # User endpoints
│   ├── user.service.ts        # User business logic
│   ├── user.module.ts         # User module
│   ├── dto/                   # User DTOs
│   └── schemas/               # User MongoDB schemas
├── work-experience/           # Work experience management
├── education/                 # Education management
├── skills/                    # Skills management
├── icons/                     # Icons management
└── guards/                    # Global guards (API key)
```

## 🔐 Authentication

The API uses two authentication methods:

1. **JWT Authentication**: For user-specific operations
2. **API Key Authentication**: For general API access

### JWT Authentication
- Login endpoint: `POST /auth/login`
- Signup endpoint: `POST /auth/signup`
- Include JWT token in Authorization header: `Bearer <token>`

### API Key Authentication
- Include API key in header: `x-api-key: <your-api-key>`

## 📊 Available Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `PATCH /auth/change-password` - Change user password

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID

### Work Experience
- `GET /work-experience` - Get work experience

### Education
- `GET /education` - Get education records

### Skills
- `GET /skills` - Get skills

### Icons
- `GET /icons` - Get icons

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 🚀 Development Commands

```bash
# Start development server
yarn start:dev

# Build for production
yarn build

# Start production server
yarn start:prod

# Lint code
yarn lint

# Format code
yarn format
```

## 🌍 Multilingual Support

The API supports multilingual content through the `InfoLocalized` schema, allowing users to provide information in multiple languages:

- English (`en`)
- Spanish (`es`)
- Additional languages can be configured

## 📝 Data Models

### User Schema
- Personal information (name, email, phone, location)
- Available languages
- CV documents (multiple language versions)
- Social network links
- Role-based access (GUEST, ADMIN)

### Work Experience Schema
- Company information
- Position details
- Duration and responsibilities
- Multilingual descriptions

### Education Schema
- Institution details
- Degree information
- Duration and achievements

### Skills Schema
- Skill categories
- Proficiency levels
- Associated icons

## 🔒 Security Features

- JWT token-based authentication
- API key validation
- Role-based access control
- Password hashing
- CORS enabled
- Input validation with DTOs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

