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

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/youtube_reader
GEMINI_API_KEY=your_gemini_api_key
```

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
