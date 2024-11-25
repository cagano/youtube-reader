# YouTube Reader

An AI-powered application for processing and reorganizing YouTube video transcripts, featuring automatic transcript processing and content analysis capabilities through Gemini AI integration.

## Features

- YouTube transcript extraction with English support
- Gemini AI integration (gemini-1.5-flash-latest)
- Template-based processing system with database integration
- Chunk-based transcript processing with performance optimization
- Interactive UI with responsive viewport and theme switching
- Font size adjustment controls with tooltips
- Error boundary system with state management
- Clipboard integration with visual feedback
- ReactMarkdown formatting
- Multiple export formats (PDF, Markdown, Plain text)
- Full-screen reading mode with dynamic height adjustments
- Loading states and transitions

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v18 or later)
- npm (v9 or later)
- PostgreSQL database

## Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory with the following required variables:

```env
# Database connection string (required)
DATABASE_URL=postgresql://user:password@localhost:5432/youtube_reader

# Google Gemini API key for AI processing (required)
GEMINI_API_KEY=your_gemini_api_key

# YouTube Data API v3 key for video information (required)
YOUTUBE_API_KEY=your_youtube_api_key
```

### Optional Environment Variables

```env
# Server port (default: 5000)
PORT=5000

# Development mode (default: development)
NODE_ENV=development

# Client URL for CORS (default: http://localhost:5173)
CLIENT_URL=http://localhost:5173

# Database connection pool settings
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=10000

# API rate limiting (requests per minute)
RATE_LIMIT=100
```

### Environment Variable Details

1. **DATABASE_URL**
   - Format: `postgresql://<username>:<password>@<host>:<port>/<database>`
   - Example: `postgresql://user:password@localhost:5432/youtube_reader`
   - Note: Special characters in password must be URL-encoded

2. **GEMINI_API_KEY**
   - Obtain from [Google AI Studio](https://ai.google.dev/)
   - Required for AI-powered transcript processing
   - Rate limits apply based on your API quota

3. **YOUTUBE_API_KEY**
   - Obtain from Google Cloud Console (see YouTube API setup section)
   - Required for fetching video information and transcripts
   - Daily quota limits apply

### Environment Validation

The application validates environment variables on startup. Common issues:

- Missing required variables will prevent startup
- Invalid DATABASE_URL format will cause connection errors
- Invalid API keys will result in 401/403 errors
- Special characters in DATABASE_URL must be properly escaped

### Development vs Production

For production deployment:
```env
NODE_ENV=production
CLIENT_URL=https://your-production-domain.com
RATE_LIMIT=60
```

For development:
```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RATE_LIMIT=100
```

### Setting up YouTube API Key

To obtain your YouTube API key:

1. Create a Google Cloud Project:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click on "Create Project" or select an existing project
   - Give your project a name and click "Create"

2. Enable the YouTube Data API v3:
   - In the Google Cloud Console, navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on the API and click "Enable"

3. Create API Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - (Optional) Restrict the API key to only YouTube Data API v3 for security

4. Add the API key to your `.env` file as `YOUTUBE_API_KEY`

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd youtube-reader
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:migrate
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t youtube-reader .
```

2. Run the container:
```bash
docker run -d \
  -p 5000:5000 \
  -p 5173:5173 \
  --env-file .env \
  --name youtube-reader \
  youtube-reader
```

Note: Make sure all environment variables are properly set in your .env file before building and running the container.

### Docker Compose (Alternative)

You can also use Docker Compose for easier deployment. Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
      - "5173:5173"
    env_file:
      - .env
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: youtube_reader
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

## Development

To start the development server:

```bash
npm run dev
```

This will start:
- Frontend development server at http://localhost:5173
- Backend API server at http://localhost:5000

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and API clients
│   │   └── pages/       # Page components
├── db/                   # Database schema and configuration
├── server/              # Backend Express server
│   ├── routes.ts        # API routes
│   └── templates.ts     # Processing templates
```

## API Endpoints

- `GET /api/transcript/:videoId` - Fetch YouTube video transcript
- `POST /api/suggest-templates` - Get AI suggestions for processing
- `GET /api/templates` - List available processing templates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
