#!/usr/bin/env node

/**
 * Wiki.js MCP Server
 *
 * Provides Model Context Protocol (MCP) tools for interacting with Wiki.js GraphQL API
 *
 * @author Markus Michalski
 * @license MIT
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

import { WikiJsClient } from './services/client.js';
import {
  createPageToolDefinition,
  handleCreatePage,
  getPageToolDefinition,
  handleGetPage,
  listPagesToolDefinition,
  handleListPages,
  searchPagesToolDefinition,
  handleSearchPages,
  updatePageToolDefinition,
  handleUpdatePage,
  deletePageToolDefinition,
  handleDeletePage,
  movePageToolDefinition,
  handleMovePage,
} from './tools/index.js';

// Load environment variables from deployment directory
const envPath = join(homedir(), '.claude', 'mcp-servers', 'wikijs', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Fallback to CWD for development
  dotenv.config();
}

// Validate required environment variables
const WIKIJS_API_URL = process.env.WIKIJS_API_URL;
const WIKIJS_API_TOKEN = process.env.WIKIJS_API_TOKEN;

if (!WIKIJS_API_URL || !WIKIJS_API_TOKEN) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure WIKIJS_API_URL and WIKIJS_API_TOKEN are set in .env file');
  console.error('');
  console.error('Expected locations:');
  console.error(`  - ${envPath}`);
  console.error('  - .env in current directory');
  process.exit(1);
}

// Initialize Wiki.js client
const wikiClient = new WikiJsClient(WIKIJS_API_URL, WIKIJS_API_TOKEN);

// Create MCP server with modern API
const server = new McpServer({
  name: 'wikijs-mcp-server',
  version: '2.0.0',
});

// Register tools using modern registerTool API
server.tool(
  createPageToolDefinition.name,
  createPageToolDefinition.description,
  createPageToolDefinition.inputSchema.shape,
  async (args) => handleCreatePage(wikiClient, args)
);

server.tool(
  getPageToolDefinition.name,
  getPageToolDefinition.description,
  getPageToolDefinition.inputSchema.shape,
  async (args) => handleGetPage(wikiClient, args)
);

server.tool(
  listPagesToolDefinition.name,
  listPagesToolDefinition.description,
  listPagesToolDefinition.inputSchema.shape,
  async (args) => handleListPages(wikiClient, args)
);

server.tool(
  searchPagesToolDefinition.name,
  searchPagesToolDefinition.description,
  searchPagesToolDefinition.inputSchema.shape,
  async (args) => handleSearchPages(wikiClient, args)
);

server.tool(
  updatePageToolDefinition.name,
  updatePageToolDefinition.description,
  updatePageToolDefinition.inputSchema.shape,
  async (args) => handleUpdatePage(wikiClient, args)
);

server.tool(
  deletePageToolDefinition.name,
  deletePageToolDefinition.description,
  deletePageToolDefinition.inputSchema.shape,
  async (args) => handleDeletePage(wikiClient, args)
);

server.tool(
  movePageToolDefinition.name,
  movePageToolDefinition.description,
  movePageToolDefinition.inputSchema.shape,
  async (args) => handleMovePage(wikiClient, args)
);

// Graceful shutdown handling
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.error(`Received ${signal}, shutting down gracefully...`);
  try {
    await server.close();
    console.error('Wiki.js MCP Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Setup signal handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error: Error & { code?: string }) => {
  // Don't log EPIPE errors (broken pipe when client disconnects)
  if (error.code !== 'EPIPE') {
    console.error('Uncaught exception:', error);
  }
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Wiki.js MCP Server v2.0.0 running on stdio');
  console.error(`Connected to: ${WIKIJS_API_URL}`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
