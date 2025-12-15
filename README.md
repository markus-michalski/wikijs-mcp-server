# Wiki.js MCP Server

**Model Context Protocol Server for Wiki.js integration in Claude Code** - Create and manage wiki pages directly from your AI assistant.

## v2.0.0 - Major Refactoring

This version includes a complete rewrite following MCP Best Practices:

- **TypeScript** - Full type safety with strict mode
- **Modern SDK** - Uses MCP SDK v1.24+ with `McpServer.tool()` API
- **Zod Validation** - Runtime input validation for all tools
- **Service-Prefixed Tools** - All tools use `wikijs_` prefix for namespace clarity
- **Tool Annotations** - Proper `readOnlyHint`, `destructiveHint`, etc.
- **Pagination Support** - List operations return `has_more`, `next_offset`, `total_count`
- **Character Limits** - Large content is truncated with clear notices

## Documentation

**[Complete Documentation & FAQ](https://faq.markus-michalski.net/en/mcp/wikijs)**

The comprehensive guide includes:
- Installation instructions
- Configuration examples
- All 7 MCP tools with parameters
- GraphQL API integration details
- Troubleshooting guide

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/markus-michalski/wikijs-mcp-server.git ~/.claude/mcp-servers/wikijs

# 2. Install dependencies
cd ~/.claude/mcp-servers/wikijs
npm install

# 3. Build TypeScript
npm run build

# 4. Configure environment
cp .env.example .env
# Edit .env with your Wiki.js API credentials

# 5. Add to Claude Code config and restart
```

## Requirements

- **Node.js 18+**
- **Wiki.js instance** (v2.x or v3.x)
- **Wiki.js API Token** with page management permissions

## Available Tools

| Tool | Description | Annotations |
|------|-------------|-------------|
| `wikijs_create_page` | Create new wiki pages with Markdown or HTML | `destructiveHint: false` |
| `wikijs_update_page` | Update existing pages (content, title, tags) | `idempotentHint: true` |
| `wikijs_get_page` | Retrieve full page content and metadata | `readOnlyHint: true` |
| `wikijs_list_pages` | List pages with pagination and filtering | `readOnlyHint: true` |
| `wikijs_search_pages` | Full-text search across wiki pages | `readOnlyHint: true` |
| `wikijs_delete_page` | Permanently delete pages | `destructiveHint: true` |
| `wikijs_move_page` | Move pages to new paths | `destructiveHint: false` |

## Development

```bash
# Development with hot-reload
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## Project Structure

```
wikijs-mcp-server/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── constants.ts       # Shared constants (CHARACTER_LIMIT, etc.)
│   ├── types.ts           # TypeScript type definitions
│   ├── schemas/           # Zod validation schemas
│   ├── services/          # API client and error handling
│   └── tools/             # Tool implementations
├── dist/                  # Compiled JavaScript
├── evaluation.xml         # MCP evaluation test questions
└── package.json
```

## License

MIT License - See [LICENSE](./LICENSE) for details

## Author

**Markus Michalski**
- Website: [markus-michalski.net](https://markus-michalski.net)
- GitHub: [@markus-michalski](https://github.com/markus-michalski)

## Links

- **[Full Documentation](https://faq.markus-michalski.net/en/mcp/wikijs)** (English)
- **[Vollstaendige Dokumentation](https://faq.markus-michalski.net/de/mcp/wikijs)** (Deutsch)
- [Changelog](./CHANGELOG.md)
