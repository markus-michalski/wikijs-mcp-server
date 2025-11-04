# Wiki.js MCP Server

Model Context Protocol (MCP) server for Wiki.js - enables Claude Code to create, read, update, and manage wiki pages directly from conversations.

> 📖 **Full Documentation:** [English](https://faq.markus-michalski.net/en/mcp/wikijs) | [Deutsch](https://faq.markus-michalski.net/de/mcp/wikijs)

## Features

- ✅ Create, update, and delete wiki pages
- ✅ Search and list pages with filtering
- ✅ Move pages and reorganize content
- ✅ Full GraphQL API integration
- ✅ Multi-language support

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/markus-michalski/wikijs-mcp-server.git ~/.claude/mcp-servers/wikijs
cd ~/.claude/mcp-servers/wikijs
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Wiki.js credentials:

```env
WIKIJS_API_URL=https://your-wiki.com/graphql
WIKIJS_API_TOKEN=your-api-token
```

**Get API Token:** Wiki.js Admin → API Access → Generate New Key
**Required Permissions:** `read:pages`, `write:pages`, `manage:pages`

### 3. Add to Claude Code

Edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "wikijs": {
      "type": "stdio",
      "command": "node",
      "args": ["/home/YOUR_USERNAME/.claude/mcp-servers/wikijs/index.js"],
      "env": {}
    }
  }
}
```

### 4. Restart Claude Code

```bash
/exit
claude
```

Verify connection: `/mcp` should show "wikijs ✓ connected"

## Available Tools

| Tool | Description |
|------|-------------|
| `create_page` | Create new wiki pages with markdown/HTML content |
| `update_page` | Modify existing pages (content, title, tags, etc.) |
| `get_page` | Retrieve page by ID or path |
| `list_pages` | List all pages with optional filtering |
| `search_pages` | Full-text search across wiki content |
| `delete_page` | Remove pages from wiki |
| `move_page` | Reorganize content by moving pages |

**See [full documentation](https://faq.markus-michalski.net/en/mcp/wikijs) for detailed examples and troubleshooting.**

## Example Usage

```javascript
// Claude Code automatically uses these tools when you ask:
"Create a comprehensive wiki page for my new osTicket plugin"
"Update the API documentation page with the new endpoints"
"Find all pages tagged 'deprecated' and move them to archive/"
```

## Requirements

- Node.js 18+
- Wiki.js instance with GraphQL API enabled
- Wiki.js API token with appropriate permissions

## Documentation

- 📖 [Full Documentation (English)](https://faq.markus-michalski.net/en/mcp/wikijs)
- 📖 [Vollständige Dokumentation (Deutsch)](https://faq.markus-michalski.net/de/mcp/wikijs)
- 🔧 [Wiki.js Documentation](https://docs.requarks.io)
- 🌐 [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

**Markus Michalski**
- Website: [markus-michalski.net](https://markus-michalski.net)
- Wiki: [faq.markus-michalski.net](https://faq.markus-michalski.net)
- GitHub: [@markus-michalski](https://github.com/markus-michalski)

## Contributing

Contributions welcome! Please open an issue or pull request.
