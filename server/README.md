# GOVCONNECT Server

Node.js Express API server for the GOVCONNECT application.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   ```

### Running the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Base Routes
- `GET /` - Server welcome message
- `GET /api` - API information
- `GET /api/health` - Health check endpoint

## Project Structure

```
server/
├── routes/           # API route definitions
│   └── index.js     # Main API routes
├── config.js        # Configuration settings
├── server.js        # Main server entry point
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

## Development

The server uses:
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable loading
- **nodemon** - Development auto-restart

## Future Enhancements

- Database integration
- Authentication system
- API documentation with Swagger
- Logging middleware
- Rate limiting
- Input validation
