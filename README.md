# icon-search.com

A semantic search engine for icons, currently supporting Lucide icons. Built with Next.js, Drizzle ORM, and OpenAI embeddings.

## Features

- 🔍 Semantic search for icons using natural language
- 🎯 Version-aware icon tracking
- 🔐 GitHub OAuth authentication
- 🌓 Light/dark mode support
- 🚀 Fully automated CI/CD pipeline
- 🗄️ PostgreSQL with vector search capabilities

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: GitHub OAuth
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI**: OpenAI embeddings for semantic search
- **Deployment**: Vercel
- **Database Hosting**: Neon
- **Runtime**: Bun

## Local Development

### Prerequisites

- Bun (latest version)
- PostgreSQL 15+
- Node.js 18+

### Environment Variables

Create a `.env.local` file that matches `.env.example`.


### Setup Instructions

1. Install dependencies:

```bash
bun install
```

2. Start the database (starts, migrates, seeds):

```bash
bun run db:reset
```

3. Start the development server:

```bash
bun dev
```

### Database Commands

- `bun run db:generate` - Generate Drizzle schema changes
- `bun run db:migrate` - Apply migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:reset` - Reset database (stops, starts, migrates, seeds)

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

The CI pipeline will automatically:
- Run linting checks
- Create a preview deployment
- Create a preview database branch
- Run migrations on the preview database

## License

MIT License - See LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the maintainers.