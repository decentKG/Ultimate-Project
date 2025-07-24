# Hiring Platform Backend

This is the backend service for the Hiring Platform, built with Node.js, Express, and MongoDB.

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility classes and functions
│   └── index.js          # App entry point
├── tests/                # Test files
├── .env.example          # Example environment variables
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (or MongoDB Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration

### Running the Server

- Development mode (with hot-reload):
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Environment Variables

See `.env.example` for all available environment variables.

## Contributing

1. Create a new branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

This project is licensed under the MIT License.
